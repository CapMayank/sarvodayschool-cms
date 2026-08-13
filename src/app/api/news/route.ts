/** @format */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const skip = (page - 1) * limit;
		const category = searchParams.get("category");
		const publishedOnly = searchParams.get("published") !== "false"; // Default to true

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: any = {};
		if (category) {
			where.category = category;
		}
		if (publishedOnly) {
			where.isPublished = true;
		}

		const [news, total] = await Promise.all([
			prisma.news.findMany({
				where,
				orderBy: { publishDate: "desc" },
				skip,
				take: limit,
			}),
			prisma.news.count({ where }),
		]);

		return NextResponse.json({
			data: news,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
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
