/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
		const session = request.cookies.get("better-auth.session_token");
		const { id } = await params;
		const body = await request.json();

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const news = await prisma.news.update({
			where: { id: parseInt(id) },
			data: {
				title: body.title,
				content: body.content,
				imageUrl: body.imageUrl,
				category: body.category,
				publishDate: body.publishDate ? new Date(body.publishDate) : undefined,
			},
		});

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
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const { id } = await params;

		await prisma.news.delete({
			where: { id: parseInt(id) },
		});

		return NextResponse.json({ message: "News deleted" });
	} catch (error) {
		console.error("Error deleting news:", error);
		return NextResponse.json(
			{ error: "Failed to delete news" },
			{ status: 500 }
		);
	}
}
