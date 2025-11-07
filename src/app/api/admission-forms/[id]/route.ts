/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

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

		const form = await prisma.admissionForm.findUnique({
			where: { id: parseInt(id) },
		});

		if (!form) {
			return NextResponse.json(
				{ error: "Admission form not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(form);
	} catch (error) {
		console.error("Error fetching admission form:", error);
		return NextResponse.json(
			{ error: "Failed to fetch admission form" },
			{ status: 500 }
		);
	}
}

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
		const body = await request.json();

		const form = await prisma.admissionForm.update({
			where: { id: parseInt(id) },
			data: {
				status: body.status,
				notes: body.notes,
			},
		});

		return NextResponse.json(form);
	} catch (error) {
		console.error("Error updating admission form:", error);
		return NextResponse.json(
			{ error: "Failed to update admission form" },
			{ status: 500 }
		);
	}
}

// ← ADD THIS DELETE METHOD
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

		const parsedId = parseInt(id);

		if (isNaN(parsedId)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		// Delete the admission form
		await prisma.admissionForm.delete({
			where: { id: parsedId },
		});

		return NextResponse.json(
			{ message: "Admission form deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting admission form:", error);
		return NextResponse.json(
			{ error: "Failed to delete admission form" },
			{ status: 500 }
		);
	}
}
