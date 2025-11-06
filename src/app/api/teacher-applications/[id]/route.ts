/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam);
		const body = await request.json();
		const { status, notes } = body;

		if (!status) {
			return NextResponse.json(
				{ error: "Status is required" },
				{ status: 400 }
			);
		}

		const updated = await prisma.teacherApplication.update({
			where: { id },
			data: {
				status,
				notes: notes || null,
			},
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		console.error("Error updating teacher application:", error);

		if (error.code === "P2025") {
			return NextResponse.json(
				{ error: "Application not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to update application" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam);

		await prisma.teacherApplication.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("Error deleting teacher application:", error);

		if (error.code === "P2025") {
			return NextResponse.json(
				{ error: "Application not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to delete application" },
			{ status: 500 }
		);
	}
}
