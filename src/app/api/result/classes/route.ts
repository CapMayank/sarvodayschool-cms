/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET all classes with subjects
export async function GET(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {

		const classes = await prisma.class.findMany({
			include: {
				subjects: {
					orderBy: { order: "asc" },
				},
			},
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ classes });
	} catch (error) {
		console.error("Error fetching classes:", error);
		return NextResponse.json(
			{ error: "Failed to fetch classes" },
			{ status: 500 }
		);
	}
}

// POST - Create new class
export async function POST(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { name, displayName, order } = body;

		if (!name || !displayName) {
			return NextResponse.json(
				{ error: "Name and display name are required" },
				{ status: 400 }
			);
		}

		const classData = await prisma.class.create({
			data: {
				name,
				displayName,
				order: order ?? 0,
			},
		});

		return NextResponse.json({ class: classData }, { status: 201 });
	} catch (error) {
		if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
			return NextResponse.json(
				{ error: "Class already exists" },
				{ status: 400 }
			);
		}
		console.error("Error creating class:", error);
		return NextResponse.json(
			{ error: "Failed to create class" },
			{ status: 500 }
		);
	}
}
