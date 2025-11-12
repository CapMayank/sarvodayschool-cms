/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> }
) {
	try {
		const { slug } = await params;

		const news = await prisma.news.findUnique({
			where: { slug },
		});

		if (!news) {
			return NextResponse.json({ error: "News not found" }, { status: 404 });
		}

		// Only return published news for public access
		if (!news.isPublished) {
			return NextResponse.json(
				{ error: "News not available" },
				{ status: 404 }
			);
		}

		return NextResponse.json(news);
	} catch (error) {
		console.error("Error fetching news by slug:", error);
		return NextResponse.json(
			{ error: "Failed to fetch news" },
			{ status: 500 }
		);
	}
}
