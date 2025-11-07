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
			// For theory/practical subjects, use the sum of both components
			if (subjectMark.subject.hasPractical) {
				const theoryMarks = subjectMark.theoryMarks ?? 0;
				const practicalMarks = subjectMark.practicalMarks ?? 0;
				totalMarks += theoryMarks + practicalMarks;
			} else {
				// For traditional subjects, use marksObtained
				totalMarks += subjectMark.marksObtained;
			}
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
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
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
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
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
			const { subjectId, marksObtained, theoryMarks, practicalMarks } = mark;

			// Get subject to check passing marks and if it has practical
			const subject = await prisma.subject.findUnique({
				where: { id: subjectId },
			});

			if (!subject) continue;

			let isPassed = false;
			let isTheoryPassed = null;
			let isPracticalPassed = null;
			let finalMarksObtained = marksObtained || 0;

			if (subject.hasPractical) {
				// For theory/practical subjects (classes 9-12)
				const theoryScore = theoryMarks ?? 0;
				const practicalScore = practicalMarks ?? 0;
				const totalScore = theoryScore + practicalScore;

				// Check theory pass (33% of theory max)
				isTheoryPassed = theoryScore >= (subject.theoryPassingMarks ?? 0);

				// Check practical pass (33% of practical max)
				isPracticalPassed =
					practicalScore >= (subject.practicalPassingMarks ?? 0);

				// Check total pass (33% of combined max)
				const totalPassed = totalScore >= (subject.passingMarks ?? 0);

				// Student passes only if ALL three conditions are met
				isPassed = isTheoryPassed && isPracticalPassed && totalPassed;
				finalMarksObtained = totalScore;
			} else {
				// For traditional subjects (Nursery to 8th)
				isPassed = marksObtained >= subject.passingMarks;
				finalMarksObtained = marksObtained;
			}

			await prisma.subjectMark.upsert({
				where: {
					resultId_subjectId: {
						resultId: result.id,
						subjectId,
					},
				},
				update: {
					marksObtained: finalMarksObtained,
					theoryMarks: subject.hasPractical ? theoryMarks ?? null : null,
					practicalMarks: subject.hasPractical ? practicalMarks ?? null : null,
					isPassed,
					isTheoryPassed: subject.hasPractical ? isTheoryPassed : null,
					isPracticalPassed: subject.hasPractical ? isPracticalPassed : null,
				},
				create: {
					resultId: result.id,
					subjectId,
					marksObtained: finalMarksObtained,
					theoryMarks: subject.hasPractical ? theoryMarks ?? null : null,
					practicalMarks: subject.hasPractical ? practicalMarks ?? null : null,
					isPassed,
					isTheoryPassed: subject.hasPractical ? isTheoryPassed : null,
					isPracticalPassed: subject.hasPractical ? isPracticalPassed : null,
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
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
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
