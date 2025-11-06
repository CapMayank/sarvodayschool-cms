/** @format */

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request, { params }) {
	try {
		// CHANGED: Await params before destructuring
		const { category } = await params;

		const { resources } = await cloudinary.search
			.expression(`folder:sarvodayaGallery/${category}/*`)
			.sort_by("created_at", "desc")
			.max_results(500)
			.execute();

		return NextResponse.json({
			images: resources.map((resource) => ({
				id: resource.asset_id,
				publicId: resource.public_id,
				width: resource.width,
				height: resource.height,
				format: resource.format,
				url: resource.secure_url,
			})),
		});
	} catch (error) {
		console.error("Cloudinary error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch images" },
			{ status: 500 }
		);
	}
}
