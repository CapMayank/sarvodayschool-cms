/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { deleteCloudinaryFileServer } from "@/lib/cloudinary-server";

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
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { id: idParam } = await params;
		const id = parseInt(idParam);

		const existingApp = await prisma.teacherApplication.findUnique({
			where: { id },
		});

		if (!existingApp) {
			return NextResponse.json(
				{ error: "Application not found" },
				{ status: 404 }
			);
		}

		await prisma.teacherApplication.delete({
			where: { id },
		});

		if (existingApp.resumeUrl) {
			await deleteCloudinaryFileServer(existingApp.resumeUrl);
		}

		return NextResponse.json({ success: true });
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
