/** @format */

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const folder = formData.get("folder") as string;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Convert file to base64
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		const base64 = buffer.toString("base64");
		const dataURI = `data:${file.type};base64,${base64}`;

		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(dataURI, {
			folder: folder || "sarvodaya/facilities",
			resource_type: "image",
			allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
			max_file_size: 10000000, // 10MB
		});

		return NextResponse.json({
			success: true,
			url: result.secure_url,
			publicId: result.public_id,
		});
	} catch (error) {
		console.error("Cloudinary upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload image to Cloudinary" },
			{ status: 500 }
		);
	}
}
