/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PATCH - Update category
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam);
		const body = await request.json();
		const { title, description, name } = body;

		const updated = await prisma.galleryCategory.update({
			where: { id },
			data: {
				...(title && { title }),
				...(description !== undefined && { description }),
				...(name && { name: name.replace(/\s+/g, "_") }),
			},
		});

		return NextResponse.json({ category: updated });
	} catch (error: any) {
		if (error.code === "P2025") {
			return NextResponse.json(
				{ error: "Category not found" },
				{ status: 404 }
			);
		}
		console.error("Error updating category:", error);
		return NextResponse.json(
			{ error: "Failed to update category" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete category and all images
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam);
		const category = await prisma.galleryCategory.findUnique({
			where: { id },
		});

		if (!category) {
			return NextResponse.json(
				{ error: "Category not found" },
				{ status: 404 }
			);
		}

		// Delete all images from Cloudinary folder
		try {
			const { resources } = await cloudinary.search
				.expression(`folder:"sarvodayaGallery/${category.name}"`)
				.max_results(500)
				.execute();

			if (resources && resources.length > 0) {
				const publicIds = resources.map((r: any) => r.public_id);
				await cloudinary.api.delete_resources(publicIds);
			}

			// Delete the folder itself
			await cloudinary.api.delete_folder(`sarvodayaGallery/${category.name}`);
		} catch (cloudinaryError) {
			console.error("Error deleting from Cloudinary:", cloudinaryError);
			// Continue anyway to delete database record
		}

		// Delete from database
		await prisma.galleryCategory.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting category:", error);
		return NextResponse.json(
			{ error: "Failed to delete category" },
			{ status: 500 }
		);
	}
}

// GET - Get image count and details
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: idParam } = await params;
		const id = parseInt(idParam);
		const category = await prisma.galleryCategory.findUnique({
			where: { id },
		});

		if (!category) {
			return NextResponse.json(
				{ error: "Category not found" },
				{ status: 404 }
			);
		}

		// Get image count from Cloudinary
		let imageCount = 0;
		try {
			const result = await cloudinary.search
				.expression(`folder:"sarvodayaGallery/${category.name}"`)
				.max_results(1)
				.execute();

			imageCount = result.total_count || 0;
		} catch (error) {
			console.error("Error fetching image count from Cloudinary:", error);
			imageCount = 0;
		}

		return NextResponse.json({
			category,
			imageCount,
		});
	} catch (error) {
		console.error("Error fetching category details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch category details" },
			{ status: 500 }
		);
	}
}
