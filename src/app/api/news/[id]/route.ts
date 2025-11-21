/** @format */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const news = await prisma.news.findUnique({
			where: { id: parseInt(id) },
		});

		if (!news) {
			return NextResponse.json({ error: "News not found" }, { status: 404 });
		}

		return NextResponse.json(news);
	} catch (error) {
		console.error("Error fetching news:", error);
		return NextResponse.json(
			{ error: "Failed to fetch news" },
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

		// Generate slug from title if title is changed
		const updateData: any = {
			title: body.title,
			excerpt: body.excerpt,
			detailedArticle: body.detailedArticle,
			imageUrl: body.imageUrl,
			images: body.images,
			links: body.links,
			category: body.category,
			publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
			isPublished: body.isPublished,
		};

		// Update slug if title changed and slug not manually set
		if (body.title && !body.slug) {
			updateData.slug = body.title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-")
				.trim();
		} else if (body.slug) {
			updateData.slug = body.slug;
		}

		const news = await prisma.news.update({
			where: { id: parseInt(id) },
			data: updateData,
		});

		revalidatePath("/news");
		revalidatePath("/");
		revalidatePath(`/news/${news.slug}`);

		return NextResponse.json(news);
	} catch (error) {
		console.error("Error updating news:", error);
		return NextResponse.json(
			{ error: "Failed to update news" },
			{ status: 500 }
		);
	}
}

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

		const deletedNews = await prisma.news.delete({
			where: { id: parseInt(id) },
		});

		revalidatePath("/news");
		revalidatePath("/");
		revalidatePath(`/news/${deletedNews.slug}`);

		return NextResponse.json({ message: "News deleted" });
	} catch (error) {
		console.error("Error deleting news:", error);
		return NextResponse.json(
			{ error: "Failed to delete news" },
			{ status: 500 }
		);
	}
}
