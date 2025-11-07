/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET single achievement
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params; // ← AWAIT params

		const achievement = await prisma.achievement.findUnique({
			where: { id: parseInt(id) },
		});

		if (!achievement) {
			return NextResponse.json(
				{ error: "Achievement not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(achievement);
	} catch (error) {
		console.error("Error fetching achievement:", error);
		return NextResponse.json(
			{ error: "Failed to fetch achievement" },
			{ status: 500 }
		);
	}
}

// PUT update achievement (admin only)
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
		const { id } = await params; // ← AWAIT params
		const body = await request.json();

		const achievement = await prisma.achievement.update({
			where: { id: parseInt(id) },
			data: {
				title: body.title,
				description: body.description,
				imageUrl: body.imageUrl,
				order: body.order,
			},
		});

		return NextResponse.json(achievement);
	} catch (error) {
		console.error("Error updating achievement:", error);
		return NextResponse.json(
			{ error: "Failed to update achievement" },
			{ status: 500 }
		);
	}
}

// DELETE achievement (admin only)
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
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const { id } = await params; // ← AWAIT params

		await prisma.achievement.delete({
			where: { id: parseInt(id) },
		});

		return NextResponse.json({ message: "Achievement deleted" });
	} catch (error) {
		console.error("Error deleting achievement:", error);
		return NextResponse.json(
			{ error: "Failed to delete achievement" },
			{ status: 500 }
		);
	}
}
