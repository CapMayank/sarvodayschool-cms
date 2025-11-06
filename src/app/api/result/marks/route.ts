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

// GET - Get marks for a student
export async function GET(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const studentId = searchParams.get("studentId");
		const academicYear = searchParams.get("academicYear");

		if (!studentId || !academicYear) {
			return NextResponse.json(
				{ error: "Student ID and academic year are required" },
				{ status: 400 }
			);
		}

		const result = await prisma.result.findUnique({
			where: {
				studentId_academicYear: {
					studentId: parseInt(studentId),
					academicYear,
				},
			},
			include: {
				student: {
					include: {
						class: true,
					},
				},
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
		});

		return NextResponse.json({ result });
	} catch (error) {
		console.error("Error fetching marks:", error);
		return NextResponse.json(
			{ error: "Failed to fetch marks" },
			{ status: 500 }
		);
	}
}

// POST - Create or update marks for a student
export async function POST(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { studentId, academicYear, marks } = body;

		if (!studentId || !academicYear || !marks || !Array.isArray(marks)) {
			return NextResponse.json(
				{ error: "Student ID, academic year, and marks array are required" },
				{ status: 400 }
			);
		}

		// Find or create result
		let result = await prisma.result.findUnique({
			where: {
				studentId_academicYear: {
					studentId,
					academicYear,
				},
			},
		});

		if (!result) {
			result = await prisma.result.create({
				data: {
					studentId,
					academicYear,
				},
			});
		}

		// Create or update subject marks
		for (const mark of marks) {
			const { subjectId, marksObtained } = mark;

			// Get subject to check passing marks
			const subject = await prisma.subject.findUnique({
				where: { id: subjectId },
			});

			if (!subject) continue;

			const isPassed = marksObtained >= subject.passingMarks;

			await prisma.subjectMark.upsert({
				where: {
					resultId_subjectId: {
						resultId: result.id,
						subjectId,
					},
				},
				update: {
					marksObtained,
					isPassed,
				},
				create: {
					resultId: result.id,
					subjectId,
					marksObtained,
					isPassed,
				},
			});
		}

		// Recalculate result
		await calculateResult(result.id);

		// Fetch updated result
		const updatedResult = await prisma.result.findUnique({
			where: { id: result.id },
			include: {
				student: {
					include: {
						class: true,
					},
				},
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
		});

		return NextResponse.json({ result: updatedResult }, { status: 201 });
	} catch (error) {
		console.error("Error saving marks:", error);
		return NextResponse.json(
			{ error: "Failed to save marks" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete marks for a student
export async function DELETE(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const studentId = searchParams.get("studentId");
		const academicYear = searchParams.get("academicYear");

		if (!studentId || !academicYear) {
			return NextResponse.json(
				{ error: "Student ID and academic year are required" },
				{ status: 400 }
			);
		}

		await prisma.result.delete({
			where: {
				studentId_academicYear: {
					studentId: parseInt(studentId),
					academicYear,
				},
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting marks:", error);
		return NextResponse.json(
			{ error: "Failed to delete marks" },
			{ status: 500 }
		);
	}
}
