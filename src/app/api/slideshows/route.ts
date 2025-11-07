/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
	try {
		const slideshows = await prisma.slideShow.findMany({
			where: { isActive: true },
			orderBy: { order: "asc" },
		});
		return NextResponse.json(slideshows);
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
