/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get all subjects for a class
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const classId = parseInt(params.id);
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
	{ params }: { params: { id: string } }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const classId = parseInt(params.id);
		const body = await request.json();
		const { name, code, maxMarks, passingMarks, isAdditional, order } = body;

		if (!name) {
			return NextResponse.json(
				{ error: "Subject name is required" },
				{ status: 400 }
			);
		}

		const subject = await prisma.subject.create({
			data: {
				name,
				code,
				classId,
				maxMarks: maxMarks ?? 100,
				passingMarks: passingMarks ?? 33,
				isAdditional: isAdditional ?? false,
				order: order ?? 0,
			},
		});

		return NextResponse.json({ subject }, { status: 201 });
	} catch (error) {
		if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
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
		const { id, name, code, maxMarks, passingMarks, isAdditional, order } =
			body;

		if (!id) {
			return NextResponse.json(
				{ error: "Subject ID is required" },
				{ status: 400 }
			);
		}

		const subject = await prisma.subject.update({
			where: { id },
			data: {
				...(name && { name }),
				...(code !== undefined && { code }),
				...(maxMarks !== undefined && { maxMarks }),
				...(passingMarks !== undefined && { passingMarks }),
				...(isAdditional !== undefined && { isAdditional }),
				...(order !== undefined && { order }),
			},
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
