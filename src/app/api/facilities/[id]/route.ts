/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteCloudinaryFileServer } from "@/lib/cloudinary-server";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

// GET /api/facilities/[id] - Get single facility
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const facilityId = parseInt(id);

		if (isNaN(facilityId)) {
			return NextResponse.json(
				{ error: "Invalid facility ID" },
				{ status: 400 }
			);
		}

		const facility = await prisma.facility.findUnique({
			where: { id: facilityId },
		});

		if (!facility) {
			return NextResponse.json(
				{ error: "Facility not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(facility);
	} catch (error) {
		console.error("Error fetching facility:", error);
		return NextResponse.json(
			{ error: "Failed to fetch facility" },
			{ status: 500 }
		);
	}
}

// PUT /api/facilities/[id] - Update facility (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const facilityId = parseInt(id);

		if (isNaN(facilityId)) {
			return NextResponse.json(
				{ error: "Invalid facility ID" },
				{ status: 400 }
			);
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

		// Check if facility exists
		const existingFacility = await prisma.facility.findUnique({
			where: { id: facilityId },
		});

		if (!existingFacility) {
			return NextResponse.json(
				{ error: "Facility not found" },
				{ status: 404 }
			);
		}

		// If slug is being changed, check if new slug already exists
		if (slug && slug !== existingFacility.slug) {
			const slugExists = await prisma.facility.findUnique({
				where: { slug },
			});

			if (slugExists) {
				return NextResponse.json(
					{ error: "Slug already exists" },
					{ status: 400 }
				);
			}
		}

		const facility = await prisma.facility.update({
			where: { id: facilityId },
			data: {
				...(slug && { slug }),
				...(title && { title }),
				...(description && { description }),
				...(imageUrl && { imageUrl }),
				...(highlights !== undefined && { highlights }),
				...(facilityFeatures !== undefined && { facilityFeatures }),
				...(mediaGallery !== undefined && { mediaGallery }),
				...(order !== undefined && { order }),
				...(isActive !== undefined && { isActive }),
			},
		});

		if (imageUrl && existingFacility.imageUrl && existingFacility.imageUrl !== imageUrl) {
			await deleteCloudinaryFileServer(existingFacility.imageUrl);
		}

		if (mediaGallery !== undefined && existingFacility.mediaGallery) {
			const existingMedia = (existingFacility.mediaGallery as any[]) || [];
			const newMedia = (mediaGallery as any[]) || [];
			const newMediaSrcs = new Set(newMedia.filter(m => m.type === 'image').map(m => m.src));
			
			const removedMedia = existingMedia.filter(m => m.type === 'image' && !newMediaSrcs.has(m.src));
			for (const m of removedMedia) {
				if (m.src) await deleteCloudinaryFileServer(m.src);
			}
		}

		return NextResponse.json(facility);
	} catch (error) {
		console.error("Error updating facility:", error);
		return NextResponse.json(
			{ error: "Failed to update facility" },
			{ status: 500 }
		);
	}
}

// DELETE /api/facilities/[id] - Delete facility (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const facilityId = parseInt(id);

		if (isNaN(facilityId)) {
			return NextResponse.json(
				{ error: "Invalid facility ID" },
				{ status: 400 }
			);
		}

		const facility = await prisma.facility.findUnique({
			where: { id: facilityId },
		});

		if (!facility) {
			return NextResponse.json(
				{ error: "Facility not found" },
				{ status: 404 }
			);
		}

		await prisma.facility.delete({
			where: { id: facilityId },
		});

		if (facility.imageUrl) {
			await deleteCloudinaryFileServer(facility.imageUrl);
		}
		
		if (facility.mediaGallery) {
			const media = (facility.mediaGallery as any[]) || [];
			for (const m of media) {
				if (m.type === 'image' && m.src) {
					await deleteCloudinaryFileServer(m.src);
				}
			}
		}

		return NextResponse.json({ message: "Facility deleted successfully" });
	} catch (error) {
		console.error("Error deleting facility:", error);
		return NextResponse.json(
			{ error: "Failed to delete facility" },
			{ status: 500 }
		);
	}
}
