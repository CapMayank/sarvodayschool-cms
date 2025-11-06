/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get class by ID
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
		const classData = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				subjects: {
					orderBy: { order: "asc" },
				},
			},
		});

		if (!classData) {
			return NextResponse.json({ error: "Class not found" }, { status: 404 });
		}

		return NextResponse.json({ class: classData });
	} catch (error) {
		console.error("Error fetching class:", error);
		return NextResponse.json(
			{ error: "Failed to fetch class" },
			{ status: 500 }
		);
	}
}

// PUT - Update class
export async function PUT(
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
		const { name, displayName, order, isActive } = body;

		const classData = await prisma.class.update({
			where: { id: classId },
			data: {
				...(name && { name }),
				...(displayName && { displayName }),
				...(order !== undefined && { order }),
				...(isActive !== undefined && { isActive }),
			},
		});

		return NextResponse.json({ class: classData });
	} catch (error) {
		console.error("Error updating class:", error);
		return NextResponse.json(
			{ error: "Failed to update class" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete class
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const classId = parseInt(params.id);
		await prisma.class.delete({
			where: { id: classId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting class:", error);
		return NextResponse.json(
			{ error: "Failed to delete class" },
			{ status: 500 }
		);
	}
}
