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

		const [slideshows, total] = await Promise.all([
			prisma.slideShow.findMany({
				where: { isActive: true },
				orderBy: { order: "asc" },
				skip,
				take: limit,
			}),
			prisma.slideShow.count({ where: { isActive: true } }),
		]);

		return NextResponse.json({
			data: slideshows,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching slideshows:", error);
		return NextResponse.json(
			{ error: "Failed to fetch slideshows" },
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

		const slideshow = await prisma.slideShow.create({
			data: {
				title: body.title || "",
				imageUrl: body.imageUrl,
				isActive: body.isActive !== false,
				order: body.order || 0,
			},
		});

		return NextResponse.json(slideshow, { status: 201 });
	} catch (error) {
		console.error("Error creating slideshow:", error);
		return NextResponse.json(
			{ error: "Failed to create slideshow" },
			{ status: 500 }
		);
	}
}

// PATCH /api/slideshows - Bulk reorder: [{id, order}]
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
				prisma.slideShow.update({ where: { id }, data: { order } })
			)
		);
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Error reordering slideshows:", error);
		return NextResponse.json(
			{ error: "Failed to reorder slideshows" },
			{ status: 500 }
		);
	}
}
