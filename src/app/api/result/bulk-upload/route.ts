/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
			totalMarks += subjectMark.marksObtained;
			maxTotalMarks += subjectMark.subject.maxMarks;
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
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { academicYear, classId, students, clearExisting } = body;

		if (!academicYear || !classId || !students || !Array.isArray(students)) {
			return NextResponse.json(
				{
					error:
						"Academic year, class ID, and students array are required",
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

				// Create subject marks
				if (marks && typeof marks === "object") {
					for (const [subjectName, marksObtained] of Object.entries(marks)) {
						const subject = subjects.find((s) => s.name === subjectName);

						if (!subject) {
							errors.push({
								rollNumber,
								error: `Subject "${subjectName}" not found for this class`,
							});
							continue;
						}

						const isPassed =
							parseFloat(marksObtained as string) >= subject.passingMarks;

						await prisma.subjectMark.upsert({
							where: {
								resultId_subjectId: {
									resultId: result.id,
									subjectId: subject.id,
								},
							},
							update: {
								marksObtained: parseFloat(marksObtained as string),
								isPassed,
							},
							create: {
								resultId: result.id,
								subjectId: subject.id,
								marksObtained: parseFloat(marksObtained as string),
								isPassed,
							},
						});
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
