/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
	params: Promise<{
		slug: string;
	}>;
}

// GET /api/facilities/slug/[slug] - Get facility by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { slug } = await params;

		const facility = await prisma.facility.findUnique({
			where: { slug },
		});

		if (!facility) {
			return NextResponse.json(
				{ error: "Facility not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(facility);
	} catch (error) {
		console.error("Error fetching facility by slug:", error);
		return NextResponse.json(
			{ error: "Failed to fetch facility" },
			{ status: 500 }
		);
	}
}
