/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all gallery categories
export async function GET(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const categories = await prisma.galleryCategory.findMany({
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ categories });
	} catch (error) {
		console.error("Error fetching gallery categories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}

// POST - Create new gallery category
export async function POST(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { name, title, description } = body;

		if (!name || !title) {
			return NextResponse.json(
				{ error: "Name and title are required" },
				{ status: 400 }
			);
		}

		// Get max order
		const maxOrder = await prisma.galleryCategory.findFirst({
			orderBy: { order: "desc" },
			select: { order: true },
		});

		const category = await prisma.galleryCategory.create({
			data: {
				name: name.replace(/\s+/g, "_"),
				title,
				description: description || "",
				order: (maxOrder?.order ?? -1) + 1,
			},
		});

		return NextResponse.json({ category }, { status: 201 });
	} catch (error: any) {
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "Category name already exists" },
				{ status: 400 }
			);
		}
		console.error("Error creating gallery category:", error);
		return NextResponse.json(
			{ error: "Failed to create category" },
			{ status: 500 }
		);
	}
}

// PUT - Reorder categories
export async function PUT(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { categories } = body;

		if (!Array.isArray(categories)) {
			return NextResponse.json(
				{ error: "Invalid categories format" },
				{ status: 400 }
			);
		}

		const updated = await Promise.all(
			categories.map((cat: any, index: number) =>
				prisma.galleryCategory.update({
					where: { id: cat.id },
					data: { order: index },
				})
			)
		);

		return NextResponse.json({ categories: updated });
	} catch (error) {
		console.error("Error reordering categories:", error);
		return NextResponse.json(
			{ error: "Failed to reorder categories" },
			{ status: 500 }
		);
	}
}
