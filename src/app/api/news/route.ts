/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const limit = parseInt(searchParams.get("limit") || "10");
		const category = searchParams.get("category");

		let where: any = {};
		if (category) {
			where.category = category;
		}

		const news = await prisma.news.findMany({
			where,
			orderBy: { publishDate: "desc" },
			take: limit,
		});
		return NextResponse.json(news);
	} catch (error) {
		console.error("Error fetching news:", error);
		return NextResponse.json(
			{ error: "Failed to fetch news" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		const body = await request.json();

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const news = await prisma.news.create({
			data: {
				title: body.title,
				content: body.content,
				imageUrl: body.imageUrl || "",
				category: body.category || "General",
				publishDate: new Date(body.publishDate),
			},
		});

		return NextResponse.json(news, { status: 201 });
	} catch (error) {
		console.error("Error creating news:", error);
		return NextResponse.json(
			{ error: "Failed to create news" },
			{ status: 500 }
		);
	}
}
