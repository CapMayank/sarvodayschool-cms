/** @format */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const limit = parseInt(searchParams.get("limit") || "10");
		const category = searchParams.get("category");
		const publishedOnly = searchParams.get("published") !== "false"; // Default to true

		let where: any = {};
		if (category) {
			where.category = category;
		}
		if (publishedOnly) {
			where.isPublished = true;
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
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const body = await request.json();

		// Generate slug from title if not provided
		const slug =
			body.slug ||
			body.title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();

		const news = await prisma.news.create({
			data: {
				slug,
				title: body.title,
				excerpt: body.excerpt,
				detailedArticle: body.detailedArticle || body.excerpt,
				imageUrl: body.imageUrl || null,
				images: body.images || [],
				links: body.links || null,
				category: body.category || "General",
				publishDate: new Date(body.publishDate),
				isPublished: body.isPublished !== undefined ? body.isPublished : true,
			},
		});

		revalidatePath("/news");
		revalidatePath("/");

		return NextResponse.json(news, { status: 201 });
	} catch (error) {
		console.error("Error creating news:", error);
		return NextResponse.json(
			{ error: "Failed to create news" },
			{ status: 500 }
		);
	}
}
