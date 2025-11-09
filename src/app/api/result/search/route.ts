/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Search for student result (public API)
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { rollNumber, enrollmentNo, dateOfBirth, academicYear } = body;

		if (!rollNumber || !academicYear) {
			return NextResponse.json(
				{ error: "Roll number and academic year are required" },
				{ status: 400 }
			);
		}

		// Verify that one of enrollmentNo or dateOfBirth is provided
		if (!enrollmentNo && !dateOfBirth) {
			return NextResponse.json(
				{ error: "Either enrollment number or date of birth is required" },
				{ status: 400 }
			);
		}

		// Check if results are published for this academic year
		const publication = await prisma.resultPublication.findUnique({
			where: { academicYear },
		});

		if (!publication) {
			return NextResponse.json(
				{ error: "Results not available for this academic year" },
				{ status: 404 }
			);
		}

		const now = new Date();
		if (!publication.isPublished && now < publication.publishDate) {
			return NextResponse.json(
				{
					error: "Results are not yet published",
					publishDate: publication.publishDate,
				},
				{ status: 403 }
			);
		}

		// Find student
		const where: {
			rollNumber: string;
			academicYear: string;
			enrollmentNo?: string;
		} = {
			rollNumber,
			academicYear,
		};

		if (enrollmentNo) {
			where.enrollmentNo = enrollmentNo;
		}

		const student = await prisma.student.findFirst({
			where,
			include: {
				class: {
					include: {
						subjects: {
							orderBy: { order: "asc" },
						},
					},
				},
				results: {
					where: { academicYear },
					include: {
						subjectMarks: {
							include: {
								subject: true,
							},
							orderBy: {
								subject: {
									order: "asc",
								},
							},
						},
					},
				},
				optedInSubjects: {
					include: {
						subject: true,
					},
				},
			},
		});

		if (!student) {
			return NextResponse.json(
				{ error: "Student not found with provided credentials" },
				{ status: 404 }
			);
		}

		// Verify date of birth if provided
		if (dateOfBirth) {
			const providedDOB = new Date(dateOfBirth);
			const studentDOB = new Date(student.dateOfBirth);

			// Compare dates (year, month, day only)
			if (
				providedDOB.getFullYear() !== studentDOB.getFullYear() ||
				providedDOB.getMonth() !== studentDOB.getMonth() ||
				providedDOB.getDate() !== studentDOB.getDate()
			) {
				return NextResponse.json(
					{ error: "Invalid credentials" },
					{ status: 401 }
				);
			}
		}

		// Check if result exists
		if (!student.results || student.results.length === 0) {
			return NextResponse.json(
				{ error: "Result not found for this student" },
				{ status: 404 }
			);
		}

		const result = student.results[0];

		return NextResponse.json({
			student: {
				id: student.id,
				rollNumber: student.rollNumber,
				enrollmentNo: student.enrollmentNo,
				name: student.name,
				fatherName: student.fatherName,
				dateOfBirth: student.dateOfBirth,
				class: student.class.displayName,
			},
			result: {
				totalMarks: result.totalMarks,
				maxTotalMarks: result.maxTotalMarks,
				percentage: result.percentage,
				isPassed: result.isPassed,
				subjectMarks: result.subjectMarks.map((sm) => {
					// Handle both traditional and theory/practical marking systems
					if (sm.subject.hasPractical) {
						// For classes 9-12 with theory+practical
						return {
							subject: sm.subject.name,
							marksObtained: (sm.theoryMarks || 0) + (sm.practicalMarks || 0),
							theoryMarks: sm.theoryMarks || 0,
							practicalMarks: sm.practicalMarks || 0,
							theoryMaxMarks: sm.subject.theoryMaxMarks || 0,
							practicalMaxMarks: sm.subject.practicalMaxMarks || 0,
							maxMarks: sm.subject.maxMarks,
							passingMarks: sm.subject.passingMarks,
							theoryPassingMarks: sm.subject.theoryPassingMarks || 0,
							practicalPassingMarks: sm.subject.practicalPassingMarks || 0,
							isPassed: sm.isPassed,
							isTheoryPassed: sm.isTheoryPassed || false,
							isPracticalPassed: sm.isPracticalPassed || false,
							isAdditional: sm.subject.isAdditional,
							hasPractical: true,
						};
					} else {
						// For classes Nursery-8th (traditional marking)
						return {
							subject: sm.subject.name,
							marksObtained: sm.marksObtained,
							maxMarks: sm.subject.maxMarks,
							passingMarks: sm.subject.passingMarks,
							isPassed: sm.isPassed,
							isAdditional: sm.subject.isAdditional,
							hasPractical: false,
						};
					}
				}),
			},
		});
	} catch (error) {
		console.error("Error searching for result:", error);
		return NextResponse.json(
			{ error: "Failed to search for result" },
			{ status: 500 }
		);
	}
}
