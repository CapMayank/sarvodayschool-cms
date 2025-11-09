/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// Helper function to calculate result
async function calculateResult(resultId: number) {
	const result = await prisma.result.findUnique({
		where: { id: resultId },
		include: {
			subjectMarks: {
				include: {
					subject: true,
				},
			},
		},
	});

	if (!result) return;

	let totalMarks = 0;
	let maxTotalMarks = 0;
	let allPassed = true;

	for (const subjectMark of result.subjectMarks) {
		// Only include non-additional subjects in grand total
		if (!subjectMark.subject.isAdditional) {
			if (subjectMark.subject.hasPractical) {
				// For classes 9-12 with theory+practical
				const theoryMarks = subjectMark.theoryMarks || 0;
				const practicalMarks = subjectMark.practicalMarks || 0;
				totalMarks += theoryMarks + practicalMarks;
				maxTotalMarks +=
					(subjectMark.subject.theoryMaxMarks || 0) +
					(subjectMark.subject.practicalMaxMarks || 0);
			} else {
				// For classes Nursery-8th (traditional marking)
				totalMarks += subjectMark.marksObtained;
				maxTotalMarks += subjectMark.subject.maxMarks;
			}
		}

		// Check if subject is passed
		if (!subjectMark.isPassed) {
			allPassed = false;
		}
	}

	const percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;

	await prisma.result.update({
		where: { id: resultId },
		data: {
			totalMarks,
			maxTotalMarks,
			percentage,
			isPassed: allPassed,
		},
	});
}

// POST - Bulk upload results from JSON data (processed from Excel)
export async function POST(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const body = await request.json();
		const { academicYear, classId, students, clearExisting } = body;

		if (!academicYear || !classId || !students || !Array.isArray(students)) {
			return NextResponse.json(
				{
					error: "Academic year, class ID, and students array are required",
				},
				{ status: 400 }
			);
		}

		// Optionally clear existing results for this academic year and class
		if (clearExisting) {
			const existingStudents = await prisma.student.findMany({
				where: {
					classId,
					academicYear,
				},
			});

			for (const student of existingStudents) {
				await prisma.result.deleteMany({
					where: {
						studentId: student.id,
						academicYear,
					},
				});
			}
		}

		const results = [];
		const errors = [];

		for (const studentData of students) {
			try {
				const {
					rollNumber,
					enrollmentNo,
					name,
					fatherName,
					dateOfBirth,
					marks,
				} = studentData;

				// Validate required fields
				if (
					!rollNumber ||
					!enrollmentNo ||
					!name ||
					!fatherName ||
					!dateOfBirth
				) {
					errors.push({
						rollNumber,
						error: "Missing required student information",
					});
					continue;
				}

				// Find or create student
				let student = await prisma.student.findFirst({
					where: {
						rollNumber,
						academicYear,
					},
				});

				if (!student) {
					student = await prisma.student.create({
						data: {
							rollNumber,
							enrollmentNo,
							name,
							fatherName,
							dateOfBirth: new Date(dateOfBirth),
							classId,
							academicYear,
						},
					});
				}

				// Create or update result
				let result = await prisma.result.findUnique({
					where: {
						studentId_academicYear: {
							studentId: student.id,
							academicYear,
						},
					},
				});

				if (!result) {
					result = await prisma.result.create({
						data: {
							studentId: student.id,
							academicYear,
						},
					});
				}

				// Get all subjects for the class
				const subjects = await prisma.subject.findMany({
					where: { classId },
				});

				// Get student's opted-in additional subjects
				const optedInSubjects = await prisma.studentSubjectOptIn.findMany({
					where: { studentId: student.id },
					select: { subjectId: true },
				});
				const optedInSubjectIds = optedInSubjects.map((opt) => opt.subjectId);

				// Create subject marks
				if (marks && typeof marks === "object") {
					for (const [subjectName, markData] of Object.entries(marks)) {
						const subject = subjects.find((s) => s.name === subjectName);

						if (!subject) {
							errors.push({
								rollNumber,
								error: `Subject "${subjectName}" not found for this class`,
							});
							continue;
						}

						// Check if subject is additional and student has opted in
						if (
							subject.isAdditional &&
							!optedInSubjectIds.includes(subject.id)
						) {
							// Skip this subject - student hasn't opted in
							continue;
						}

						// Handle different marking systems
						if (
							subject.hasPractical &&
							markData &&
							typeof markData === "object"
						) {
							// For classes 9-12 with theory+practical
							const { theoryMarks, practicalMarks } = markData as {
								theoryMarks?: number;
								practicalMarks?: number;
								subjectId: number;
							};

							// Validate marks
							let validTheoryMarks = 0;
							let validPracticalMarks = 0;
							let hasValidTheory = false;
							let hasValidPractical = false;

							if (theoryMarks !== undefined && theoryMarks !== null) {
								if (!isNaN(theoryMarks) && isFinite(theoryMarks)) {
									validTheoryMarks = theoryMarks;
									hasValidTheory = true;
								}
							}

							if (practicalMarks !== undefined && practicalMarks !== null) {
								if (!isNaN(practicalMarks) && isFinite(practicalMarks)) {
									validPracticalMarks = practicalMarks;
									hasValidPractical = true;
								}
							}

							if (!hasValidTheory && !hasValidPractical) {
								errors.push({
									rollNumber,
									error: `Invalid theory or practical marks for subject "${subjectName}"`,
								});
								continue;
							}

							// Check passing criteria for theory/practical
							const theoryPassing = subject.theoryPassingMarks || 0;
							const practicalPassing = subject.practicalPassingMarks || 0;

							const isTheoryPassed = hasValidTheory
								? validTheoryMarks >= theoryPassing
								: false;
							const isPracticalPassed = hasValidPractical
								? validPracticalMarks >= practicalPassing
								: false;
							const isOverallPassed = isTheoryPassed && isPracticalPassed;

							await prisma.subjectMark.upsert({
								where: {
									resultId_subjectId: {
										resultId: result.id,
										subjectId: subject.id,
									},
								},
								update: {
									theoryMarks: hasValidTheory ? validTheoryMarks : null,
									practicalMarks: hasValidPractical
										? validPracticalMarks
										: null,
									isTheoryPassed: hasValidTheory ? isTheoryPassed : null,
									isPracticalPassed: hasValidPractical
										? isPracticalPassed
										: null,
									isPassed: isOverallPassed,
									marksObtained: 0, // Reset traditional marks
								},
								create: {
									resultId: result.id,
									subjectId: subject.id,
									theoryMarks: hasValidTheory ? validTheoryMarks : null,
									practicalMarks: hasValidPractical
										? validPracticalMarks
										: null,
									isTheoryPassed: hasValidTheory ? isTheoryPassed : null,
									isPracticalPassed: hasValidPractical
										? isPracticalPassed
										: null,
									isPassed: isOverallPassed,
									marksObtained: 0,
								},
							});
						} else {
							// For classes Nursery-8th (traditional marking)
							const marksObtained =
								markData && typeof markData === "object"
									? (markData as { marksObtained?: number }).marksObtained
									: typeof markData === "number"
									? markData
									: 0;

							if (
								marksObtained === undefined ||
								marksObtained === null ||
								isNaN(marksObtained) ||
								!isFinite(marksObtained)
							) {
								errors.push({
									rollNumber,
									error: `Invalid marks value for subject "${subjectName}"`,
								});
								continue;
							}

							const isPassed = marksObtained >= subject.passingMarks;

							await prisma.subjectMark.upsert({
								where: {
									resultId_subjectId: {
										resultId: result.id,
										subjectId: subject.id,
									},
								},
								update: {
									marksObtained: marksObtained,
									isPassed,
									theoryMarks: null, // Reset theory/practical marks
									practicalMarks: null,
									isTheoryPassed: null,
									isPracticalPassed: null,
								},
								create: {
									resultId: result.id,
									subjectId: subject.id,
									marksObtained: marksObtained,
									isPassed,
								},
							});
						}
					}
				}

				// Recalculate result
				await calculateResult(result.id);
				results.push({ rollNumber, status: "success" });
			} catch (error) {
				errors.push({
					rollNumber: studentData.rollNumber,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		return NextResponse.json(
			{
				message: "Bulk upload completed",
				results,
				errors,
				totalProcessed: students.length,
				successCount: results.length,
				errorCount: errors.length,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error in bulk upload:", error);
		return NextResponse.json(
			{ error: "Failed to process bulk upload" },
			{ status: 500 }
		);
	}
}
