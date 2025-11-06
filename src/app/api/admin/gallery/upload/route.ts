/** @format */

import { NextRequest, NextResponse } from "next/server";

// POST - Get upload signature for client-side upload
export async function POST(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { categoryName } = body;

		if (!categoryName) {
			return NextResponse.json(
				{ error: "Category name required" },
				{ status: 400 }
			);
		}

		const timestamp = Math.round(Date.now() / 1000);
		const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

		return NextResponse.json({
			uploadPreset,
			folder: `sarvodayaGallery/${categoryName}`,
			timestamp,
		});
	} catch (error) {
		console.error("Error generating upload signature:", error);
		return NextResponse.json(
			{ error: "Failed to generate upload signature" },
			{ status: 500 }
		);
	}
}
