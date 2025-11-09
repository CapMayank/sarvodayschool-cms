/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET - Get student by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { id } = await params;
		const studentId = parseInt(id);
		const student = await prisma.student.findUnique({
			where: { id: studentId },
			include: {
				class: true,
				results: {
					include: {
						subjectMarks: {
							include: {
								subject: true,
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
			return NextResponse.json({ error: "Student not found" }, { status: 404 });
		}

		return NextResponse.json({ student });
	} catch (error) {
		console.error("Error fetching student:", error);
		return NextResponse.json(
			{ error: "Failed to fetch student" },
			{ status: 500 }
		);
	}
}

// PUT - Update student
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { id } = await params;
		const studentId = parseInt(id);
		const body = await request.json();
		const { rollNumber, enrollmentNo, name, fatherName, dateOfBirth, classId } =
			body;

		const student = await prisma.student.update({
			where: { id: studentId },
			data: {
				...(rollNumber && { rollNumber }),
				...(enrollmentNo && { enrollmentNo }),
				...(name && { name }),
				...(fatherName && { fatherName }),
				...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
				...(classId && { classId: parseInt(classId) }),
			},
			include: {
				class: true,
			},
		});

		return NextResponse.json({ student });
	} catch (error) {
		console.error("Error updating student:", error);
		return NextResponse.json(
			{ error: "Failed to update student" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete student
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { id } = await params;
		const studentId = parseInt(id);
		await prisma.student.delete({
			where: { id: studentId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting student:", error);
		return NextResponse.json(
			{ error: "Failed to delete student" },
			{ status: 500 }
		);
	}
}
