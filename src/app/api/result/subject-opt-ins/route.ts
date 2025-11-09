/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET - Get opt-in information
// Query params: studentId OR subjectId (to get all opt-ins for a student or subject)
export async function GET(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const studentId = searchParams.get("studentId");
		const subjectId = searchParams.get("subjectId");

		if (studentId) {
			// Get all subjects a student has opted into
			const optIns = await prisma.studentSubjectOptIn.findMany({
				where: { studentId: parseInt(studentId) },
				include: {
					subject: true,
				},
			});

			return NextResponse.json({ optIns });
		} else if (subjectId) {
			// Get all students who have opted into a subject
			const optIns = await prisma.studentSubjectOptIn.findMany({
				where: { subjectId: parseInt(subjectId) },
				include: {
					student: {
						include: {
							class: true,
						},
					},
				},
			});

			return NextResponse.json({ optIns });
		} else {
			return NextResponse.json(
				{ error: "Either studentId or subjectId is required" },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error fetching subject opt-ins:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subject opt-ins" },
			{ status: 500 }
		);
	}
}

// POST - Add student to an additional subject (opt-in)
export async function POST(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { studentId, subjectId } = body;

		if (!studentId || !subjectId) {
			return NextResponse.json(
				{ error: "Student ID and Subject ID are required" },
				{ status: 400 }
			);
		}

		// Verify the subject is marked as additional
		const subject = await prisma.subject.findUnique({
			where: { id: subjectId },
		});

		if (!subject) {
			return NextResponse.json({ error: "Subject not found" }, { status: 404 });
		}

		if (!subject.isAdditional) {
			return NextResponse.json(
				{
					error:
						"Only additional subjects require opt-in. Regular subjects are automatically assigned.",
				},
				{ status: 400 }
			);
		}

		// Verify student exists
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			include: { class: true },
		});

		if (!student) {
			return NextResponse.json({ error: "Student not found" }, { status: 404 });
		}

		// Verify subject belongs to student's class
		if (subject.classId !== student.classId) {
			return NextResponse.json(
				{ error: "Subject does not belong to student's class" },
				{ status: 400 }
			);
		}

		// Create opt-in (upsert to handle duplicates gracefully)
		const optIn = await prisma.studentSubjectOptIn.upsert({
			where: {
				studentId_subjectId: {
					studentId,
					subjectId,
				},
			},
			update: {},
			create: {
				studentId,
				subjectId,
			},
			include: {
				subject: true,
			},
		});

		return NextResponse.json({ optIn }, { status: 201 });
	} catch (error) {
		console.error("Error creating subject opt-in:", error);
		return NextResponse.json(
			{ error: "Failed to create subject opt-in" },
			{ status: 500 }
		);
	}
}

// DELETE - Remove student from an additional subject (opt-out)
export async function DELETE(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(request.url);
		const studentId = searchParams.get("studentId");
		const subjectId = searchParams.get("subjectId");

		if (!studentId || !subjectId) {
			return NextResponse.json(
				{ error: "Student ID and Subject ID are required" },
				{ status: 400 }
			);
		}

		// Delete the opt-in record
		await prisma.studentSubjectOptIn.delete({
			where: {
				studentId_subjectId: {
					studentId: parseInt(studentId),
					subjectId: parseInt(subjectId),
				},
			},
		});

		// Also delete any existing marks for this student-subject combination
		// Find the result first
		const result = await prisma.result.findFirst({
			where: {
				studentId: parseInt(studentId),
			},
		});

		if (result) {
			await prisma.subjectMark.deleteMany({
				where: {
					resultId: result.id,
					subjectId: parseInt(subjectId),
				},
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting subject opt-in:", error);
		return NextResponse.json(
			{ error: "Failed to delete subject opt-in" },
			{ status: 500 }
		);
	}
}
