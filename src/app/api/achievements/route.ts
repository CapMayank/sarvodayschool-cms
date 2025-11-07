/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
	try {
		const achievements = await prisma.achievement.findMany({
			orderBy: { order: "asc" },
		});
		return NextResponse.json(achievements);
	} catch (error) {
		console.error("Error fetching achievements:", error);
		return NextResponse.json(
			{ error: "Failed to fetch achievements" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const body = await request.json();

		const achievement = await prisma.achievement.create({
			data: {
				title: body.title,
				description: body.description,
				imageUrl: body.imageUrl,
				order: body.order || 0,
			},
		});

		return NextResponse.json(achievement, { status: 201 });
	} catch (error) {
		console.error("Error creating achievement:", error);
		return NextResponse.json(
			{ error: "Failed to create achievement" },
			{ status: 500 }
		);
	}
}
