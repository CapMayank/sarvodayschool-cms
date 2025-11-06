/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get publication settings for academic year
export async function GET(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const academicYear = searchParams.get("academicYear");

		if (!academicYear) {
			// Get all publications
			const publications = await prisma.resultPublication.findMany({
				orderBy: { academicYear: "desc" },
			});
			return NextResponse.json({ publications });
		}

		const publication = await prisma.resultPublication.findUnique({
			where: { academicYear },
		});

		return NextResponse.json({ publication });
	} catch (error) {
		console.error("Error fetching publication settings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch publication settings" },
			{ status: 500 }
		);
	}
}

// POST - Create or update publication settings
export async function POST(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { academicYear, publishDate, isPublished } = body;

		if (!academicYear || !publishDate) {
			return NextResponse.json(
				{ error: "Academic year and publish date are required" },
				{ status: 400 }
			);
		}

		const publication = await prisma.resultPublication.upsert({
			where: { academicYear },
			update: {
				publishDate: new Date(publishDate),
				isPublished: isPublished ?? false,
			},
			create: {
				academicYear,
				publishDate: new Date(publishDate),
				isPublished: isPublished ?? false,
			},
		});

		return NextResponse.json({ publication }, { status: 201 });
	} catch (error) {
		console.error("Error saving publication settings:", error);
		return NextResponse.json(
			{ error: "Failed to save publication settings" },
			{ status: 500 }
		);
	}
}

// PUT - Update publication status
export async function PUT(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { academicYear, isPublished } = body;

		if (!academicYear) {
			return NextResponse.json(
				{ error: "Academic year is required" },
				{ status: 400 }
			);
		}

		const publication = await prisma.resultPublication.update({
			where: { academicYear },
			data: {
				isPublished: isPublished ?? false,
			},
		});

		return NextResponse.json({ publication });
	} catch (error) {
		console.error("Error updating publication status:", error);
		return NextResponse.json(
			{ error: "Failed to update publication status" },
			{ status: 500 }
		);
	}
}
