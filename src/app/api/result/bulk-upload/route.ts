/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { Prisma } from "@prisma/client";

type UploadMarkValue = {
	subjectId: number;
	marksObtained?: number;
	theoryMarks?: number;
	practicalMarks?: number;
	isAdditional?: boolean;
};

type UploadStudent = {
	rollNumber: string;
	enrollmentNo: string;
	name: string;
	fatherName: string;
	dateOfBirth: string;
	marks?: Record<string, UploadMarkValue | number>;
};

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

		const results: Array<{ rollNumber: string; status: "success" }> = [];
		const errors: Array<{ rollNumber?: string; error: string }> = [];

		const normalizedStudents: UploadStudent[] = [];
		for (const studentData of students as UploadStudent[]) {
			const {
				rollNumber,
				enrollmentNo,
				name,
				fatherName,
				dateOfBirth,
				marks,
			} = studentData;

			if (!rollNumber || !enrollmentNo || !name || !fatherName || !dateOfBirth) {
				errors.push({
					rollNumber,
					error: "Missing required student information",
				});
				continue;
			}

			const parsedDob = new Date(dateOfBirth);
			if (Number.isNaN(parsedDob.getTime())) {
				errors.push({
					rollNumber,
					error: "Invalid date of birth",
				});
				continue;
			}

			normalizedStudents.push({
				rollNumber,
				enrollmentNo,
				name,
				fatherName,
				dateOfBirth,
				marks,
			});
		}

		if (normalizedStudents.length === 0) {
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
		}

		if (clearExisting) {
			await prisma.result.deleteMany({
				where: {
					academicYear,
					student: {
						classId,
						academicYear,
					},
				},
			});
		}

		const subjects = await prisma.subject.findMany({ where: { classId } });
		const subjectsByName = new Map(subjects.map((subject) => [subject.name, subject]));

		const uniqueRollNumbers = Array.from(
			new Set(normalizedStudents.map((student) => student.rollNumber))
		);

		const existingStudents = await prisma.student.findMany({
			where: {
				classId,
				academicYear,
				rollNumber: { in: uniqueRollNumbers },
			},
		});
		const existingStudentByRoll = new Map(
			existingStudents.map((student) => [student.rollNumber, student])
		);

		const studentsToCreate = normalizedStudents
			.filter((student) => !existingStudentByRoll.has(student.rollNumber))
			.map((student) => ({
				rollNumber: student.rollNumber,
				enrollmentNo: student.enrollmentNo,
				name: student.name,
				fatherName: student.fatherName,
				dateOfBirth: new Date(student.dateOfBirth),
				classId,
				academicYear,
			}));

		if (studentsToCreate.length > 0) {
			await prisma.student.createMany({
				data: studentsToCreate,
				skipDuplicates: true,
			});
		}

		const allStudents = await prisma.student.findMany({
			where: {
				classId,
				academicYear,
				rollNumber: { in: uniqueRollNumbers },
			},
		});
		const studentByRoll = new Map(allStudents.map((student) => [student.rollNumber, student]));
		const studentIds = allStudents.map((student) => student.id);

		const existingResults = await prisma.result.findMany({
			where: {
				academicYear,
				studentId: { in: studentIds },
			},
			select: {
				id: true,
				studentId: true,
			},
		});
		const existingResultByStudent = new Map(
			existingResults.map((result) => [result.studentId, result])
		);

		const resultsToCreate = studentIds
			.filter((studentId) => !existingResultByStudent.has(studentId))
			.map((studentId) => ({ studentId, academicYear }));

		if (resultsToCreate.length > 0) {
			await prisma.result.createMany({
				data: resultsToCreate,
				skipDuplicates: true,
			});
		}

		const allResults = await prisma.result.findMany({
			where: {
				academicYear,
				studentId: { in: studentIds },
			},
			select: {
				id: true,
				studentId: true,
			},
		});
		const resultByStudentId = new Map(allResults.map((result) => [result.studentId, result]));
		const resultIds = allResults.map((result) => result.id);

		const optedInRows = await prisma.studentSubjectOptIn.findMany({
			where: { studentId: { in: studentIds } },
			select: { studentId: true, subjectId: true },
		});
		const optedInByStudent = new Map<number, Set<number>>();
		for (const row of optedInRows) {
			if (!optedInByStudent.has(row.studentId)) {
				optedInByStudent.set(row.studentId, new Set<number>());
			}
			optedInByStudent.get(row.studentId)?.add(row.subjectId);
		}

		if (resultIds.length > 0) {
			await prisma.subjectMark.deleteMany({
				where: {
					resultId: { in: resultIds },
				},
			});
		}

		const subjectMarksToCreate: Prisma.SubjectMarkCreateManyInput[] = [];
		const aggregates = new Map<
			number,
			{ totalMarks: number; maxTotalMarks: number; allPassed: boolean }
		>();
		for (const resultId of resultIds) {
			aggregates.set(resultId, {
				totalMarks: 0,
				maxTotalMarks: 0,
				allPassed: true,
			});
		}

		for (const studentData of normalizedStudents) {
			const student = studentByRoll.get(studentData.rollNumber);
			if (!student) {
				errors.push({
					rollNumber: studentData.rollNumber,
					error: "Student not found after bulk preparation",
				});
				continue;
			}

			const result = resultByStudentId.get(student.id);
			if (!result) {
				errors.push({
					rollNumber: studentData.rollNumber,
					error: "Result record not found after bulk preparation",
				});
				continue;
			}

			const optedInSubjectIds = optedInByStudent.get(student.id) || new Set<number>();
			const studentMarks = studentData.marks;

			if (studentMarks && typeof studentMarks === "object") {
				for (const [subjectName, markData] of Object.entries(studentMarks)) {
					const subject = subjectsByName.get(subjectName);

					if (!subject) {
						errors.push({
							rollNumber: studentData.rollNumber,
							error: `Subject "${subjectName}" not found for this class`,
						});
						continue;
					}

					if (subject.isAdditional && !optedInSubjectIds.has(subject.id)) {
						continue;
					}

					if (subject.hasPractical && markData && typeof markData === "object") {
						const { theoryMarks, practicalMarks } = markData as UploadMarkValue;

						let validTheoryMarks = 0;
						let validPracticalMarks = 0;
						let hasValidTheory = false;
						let hasValidPractical = false;

						if (theoryMarks !== undefined && theoryMarks !== null) {
							if (!Number.isNaN(theoryMarks) && Number.isFinite(theoryMarks)) {
								validTheoryMarks = theoryMarks;
								hasValidTheory = true;
							}
						}

						if (practicalMarks !== undefined && practicalMarks !== null) {
							if (!Number.isNaN(practicalMarks) && Number.isFinite(practicalMarks)) {
								validPracticalMarks = practicalMarks;
								hasValidPractical = true;
							}
						}

						if (!hasValidTheory && !hasValidPractical) {
							errors.push({
								rollNumber: studentData.rollNumber,
								error: `Invalid theory or practical marks for subject "${subjectName}"`,
							});
							continue;
						}

						const theoryPassing = subject.theoryPassingMarks || 0;
						const practicalPassing = subject.practicalPassingMarks || 0;

						const isTheoryPassed = hasValidTheory
							? validTheoryMarks >= theoryPassing
							: false;
						const isPracticalPassed = hasValidPractical
							? validPracticalMarks >= practicalPassing
							: false;
						const isOverallPassed = isTheoryPassed && isPracticalPassed;

						subjectMarksToCreate.push({
							resultId: result.id,
							subjectId: subject.id,
							theoryMarks: hasValidTheory ? validTheoryMarks : null,
							practicalMarks: hasValidPractical ? validPracticalMarks : null,
							isTheoryPassed: hasValidTheory ? isTheoryPassed : null,
							isPracticalPassed: hasValidPractical ? isPracticalPassed : null,
							isPassed: isOverallPassed,
							marksObtained: 0,
						});

						const summary = aggregates.get(result.id);
						if (summary) {
							if (!subject.isAdditional) {
								summary.totalMarks += validTheoryMarks + validPracticalMarks;
								summary.maxTotalMarks +=
									(subject.theoryMaxMarks || 0) +
									(subject.practicalMaxMarks || 0);
							}
							if (!isOverallPassed) {
								summary.allPassed = false;
							}
						}
					} else {
						const marksObtained =
							markData && typeof markData === "object"
								? (markData as UploadMarkValue).marksObtained
								: typeof markData === "number"
								? markData
								: 0;

						if (
							marksObtained === undefined ||
							marksObtained === null ||
							Number.isNaN(marksObtained) ||
							!Number.isFinite(marksObtained)
						) {
							errors.push({
								rollNumber: studentData.rollNumber,
								error: `Invalid marks value for subject "${subjectName}"`,
							});
							continue;
						}

						const isPassed = marksObtained >= subject.passingMarks;

						subjectMarksToCreate.push({
							resultId: result.id,
							subjectId: subject.id,
							marksObtained,
							isPassed,
							theoryMarks: null,
							practicalMarks: null,
							isTheoryPassed: null,
							isPracticalPassed: null,
						});

						const summary = aggregates.get(result.id);
						if (summary) {
							if (!subject.isAdditional) {
								summary.totalMarks += marksObtained;
								summary.maxTotalMarks += subject.maxMarks;
							}
							if (!isPassed) {
								summary.allPassed = false;
							}
						}
					}
				}
			}

			results.push({ rollNumber: studentData.rollNumber, status: "success" });
		}

		const batchSize = 500;
		for (let index = 0; index < subjectMarksToCreate.length; index += batchSize) {
			const chunk = subjectMarksToCreate.slice(index, index + batchSize);
			if (chunk.length > 0) {
				await prisma.subjectMark.createMany({ data: chunk });
			}
		}

		const summaryUpdates = Array.from(aggregates.entries()).map(
			([resultId, summary]) => {
				const percentage =
					summary.maxTotalMarks > 0
						? (summary.totalMarks / summary.maxTotalMarks) * 100
						: 0;
				return {
					resultId,
					totalMarks: summary.totalMarks,
					maxTotalMarks: summary.maxTotalMarks,
					percentage,
					isPassed: summary.allPassed,
				};
			}
		);

		if (summaryUpdates.length > 0) {
			const values = summaryUpdates.map((summary) =>
				Prisma.sql`(${summary.resultId}, ${summary.totalMarks}, ${summary.maxTotalMarks}, ${summary.percentage}, ${summary.isPassed})`
			);

			await prisma.$executeRaw`
				UPDATE "Result" AS r
				SET
					"totalMarks" = v.total_marks,
					"maxTotalMarks" = v.max_total_marks,
					"percentage" = v.percentage,
					"isPassed" = v.is_passed
				FROM (
					VALUES ${Prisma.join(values)}
				) AS v(result_id, total_marks, max_total_marks, percentage, is_passed)
				WHERE r.id = v.result_id
			`;
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
