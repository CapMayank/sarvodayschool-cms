/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get all subjects for a class
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const classId = parseInt(id);
		const subjects = await prisma.subject.findMany({
			where: { classId },
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ subjects });
	} catch (error) {
		console.error("Error fetching subjects:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subjects" },
			{ status: 500 }
		);
	}
}

// POST - Create new subject
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const classId = parseInt(id);
		const body = await request.json();
		const {
			name,
			code,
			maxMarks,
			passingMarks,
			isAdditional,
			order,
			theoryMaxMarks,
			practicalMaxMarks,
		} = body;

		if (!name) {
			return NextResponse.json(
				{ error: "Subject name is required" },
				{ status: 400 }
			);
		}

		// Get class information to determine if it supports theory/practical
		const classData = await prisma.class.findUnique({
			where: { id: classId },
		});

		if (!classData) {
			return NextResponse.json({ error: "Class not found" }, { status: 404 });
		}

		// Check if this is a class that supports theory/practical (9th-12th)
		const isHigherClass = [
			"9th",
			"10th",
			"11th",
			"12th",
			"9",
			"10",
			"11",
			"12",
			"12th Bio",
			"11th Bio",
			"12th Maths",
			"11th Maths",
		].includes(classData.name);

		let subjectData = {
			name,
			code,
			classId,
			maxMarks: maxMarks ?? 100,
			passingMarks: passingMarks ?? 33,
			isAdditional: isAdditional ?? false,
			order: order ?? 0,
			hasPractical: false,
			theoryMaxMarks: undefined as number | undefined,
			practicalMaxMarks: undefined as number | undefined,
			theoryPassingMarks: undefined as number | undefined,
			practicalPassingMarks: undefined as number | undefined,
		};

		if (isHigherClass) {
			// For classes 9-12, set up theory/practical structure
			const totalMarks = maxMarks ?? 100;
			const theoryMarks = theoryMaxMarks ?? Math.ceil(totalMarks * 0.8); // Default 80%
			const practicalMarks = practicalMaxMarks ?? totalMarks - theoryMarks; // Remaining 20%

			subjectData = {
				...subjectData,
				hasPractical: true,
				theoryMaxMarks: theoryMarks,
				practicalMaxMarks: practicalMarks,
				theoryPassingMarks: Math.ceil(theoryMarks * 0.33), // 33% of theory
				practicalPassingMarks: Math.ceil(practicalMarks * 0.33), // 33% of practical
				maxMarks: theoryMarks + practicalMarks, // Total = theory + practical
			};
		}

		const subject = await prisma.subject.create({
			data: subjectData,
		});

		return NextResponse.json({ subject }, { status: 201 });
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "P2002"
		) {
			return NextResponse.json(
				{ error: "Subject already exists for this class" },
				{ status: 400 }
			);
		}
		console.error("Error creating subject:", error);
		return NextResponse.json(
			{ error: "Failed to create subject" },
			{ status: 500 }
		);
	}
}

// PUT - Update subject
export async function PUT(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const {
			id,
			name,
			code,
			maxMarks,
			passingMarks,
			isAdditional,
			order,
			theoryMaxMarks,
			practicalMaxMarks,
		} = body;

		if (!id) {
			return NextResponse.json(
				{ error: "Subject ID is required" },
				{ status: 400 }
			);
		}

		// Get current subject and class info
		const currentSubject = await prisma.subject.findUnique({
			where: { id },
			include: { class: true },
		});

		if (!currentSubject) {
			return NextResponse.json({ error: "Subject not found" }, { status: 404 });
		}

		// Check if this is a class that supports theory/practical (9th-12th)
		const isHigherClass = [
			"9th",
			"10th",
			"11th",
			"12th",
			"9",
			"10",
			"11",
			"12",
		].includes(currentSubject.class.name);

		let updateData = {
			...(name && { name }),
			...(code !== undefined && { code }),
			...(maxMarks !== undefined && { maxMarks }),
			...(passingMarks !== undefined && { passingMarks }),
			...(isAdditional !== undefined && { isAdditional }),
			...(order !== undefined && { order }),
		};

		if (isHigherClass) {
			// For classes 9-12, update theory/practical fields
			if (theoryMaxMarks !== undefined || practicalMaxMarks !== undefined) {
				const totalMarks = maxMarks ?? currentSubject.maxMarks;
				const theoryMarks = theoryMaxMarks ?? Math.ceil(totalMarks * 0.8);
				const practicalMarks = practicalMaxMarks ?? totalMarks - theoryMarks;

				updateData = {
					...updateData,
					hasPractical: true,
					theoryMaxMarks: theoryMarks,
					practicalMaxMarks: practicalMarks,
					theoryPassingMarks: Math.ceil(theoryMarks * 0.33),
					practicalPassingMarks: Math.ceil(practicalMarks * 0.33),
					maxMarks: theoryMarks + practicalMarks,
				};
			}
		}

		const subject = await prisma.subject.update({
			where: { id },
			data: updateData,
		});

		return NextResponse.json({ subject });
	} catch (error) {
		console.error("Error updating subject:", error);
		return NextResponse.json(
			{ error: "Failed to update subject" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete subject
export async function DELETE(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Subject ID is required" },
				{ status: 400 }
			);
		}

		await prisma.subject.delete({
			where: { id: parseInt(id) },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting subject:", error);
		return NextResponse.json(
			{ error: "Failed to delete subject" },
			{ status: 500 }
		);
	}
}
