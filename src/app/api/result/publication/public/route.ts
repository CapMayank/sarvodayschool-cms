/** @format */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get published result information (public endpoint)
export async function GET() {
	try {
		// Find the published result publication
		const publishedResult = await prisma.resultPublication.findFirst({
			where: { isPublished: true },
			orderBy: { academicYear: "desc" },
		});

		return NextResponse.json({
			publication: publishedResult,
		});
	} catch (error) {
		console.error("Error fetching published result:", error);
		return NextResponse.json(
			{ error: "Failed to fetch published result" },
			{ status: 500 }
		);
	}
}
