/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/facilities - List all facilities
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const activeOnly = searchParams.get("activeOnly") === "true";
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "1000");
		const skip = (page - 1) * limit;

		const where = activeOnly ? { isActive: true } : undefined;

		const [facilities, total] = await Promise.all([
			prisma.facility.findMany({
				where,
				orderBy: { order: "asc" },
				skip,
				take: limit,
			}),
			prisma.facility.count({ where }),
		]);

		return NextResponse.json({
			data: facilities,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching facilities:", error);
		return NextResponse.json(
			{ error: "Failed to fetch facilities" },
			{ status: 500 }
		);
	}
}

// POST /api/facilities - Create new facility (admin only)
export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const {
			slug,
			title,
			description,
			imageUrl,
			highlights,
			facilityFeatures,
			mediaGallery,
			order,
			isActive,
		} = body;

		// Validate required fields
		if (!slug || !title || !description || !imageUrl) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Check if slug already exists
		const existingFacility = await prisma.facility.findUnique({
			where: { slug },
		});

		if (existingFacility) {
			return NextResponse.json(
				{ error: "Slug already exists" },
				{ status: 400 }
			);
		}

		const facility = await prisma.facility.create({
			data: {
				slug,
				title,
				description,
				imageUrl,
				highlights: highlights || [],
				facilityFeatures: facilityFeatures || [],
				mediaGallery: mediaGallery || [],
				order: order || 0,
				isActive: isActive !== undefined ? isActive : true,
			},
		});

		return NextResponse.json(facility, { status: 201 });
	} catch (error) {
		console.error("Error creating facility:", error);
		return NextResponse.json(
			{ error: "Failed to create facility" },
			{ status: 500 }
		);
	}
}

// PATCH /api/facilities - Bulk reorder: [{id, order}]
export async function PATCH(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const body: { id: number; order: number }[] = await request.json();
		await prisma.$transaction(
			body.map(({ id, order }) =>
				prisma.facility.update({ where: { id }, data: { order } })
			)
		);
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Error reordering facilities:", error);
		return NextResponse.json(
			{ error: "Failed to reorder facilities" },
			{ status: 500 }
		);
	}
}
