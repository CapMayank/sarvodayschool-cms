/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "1000");
		const skip = (page - 1) * limit;

		const [achievements, total] = await Promise.all([
			prisma.achievement.findMany({
				orderBy: { order: "asc" },
				skip,
				take: limit,
			}),
			prisma.achievement.count(),
		]);

		return NextResponse.json({
			data: achievements,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
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

// PATCH /api/achievements - Bulk reorder: [{id, order}]
export async function PATCH(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const body: { id: number; order: number }[] = await request.json();
		await prisma.$transaction(
			body.map(({ id, order }) =>
				prisma.achievement.update({ where: { id }, data: { order } })
			)
		);
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Error reordering achievements:", error);
		return NextResponse.json(
			{ error: "Failed to reorder achievements" },
			{ status: 500 }
		);
	}
}
