/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const slideshow = await prisma.slideShow.findUnique({
			where: { id: parseInt(id) },
		});

		if (!slideshow) {
			return NextResponse.json(
				{ error: "Slideshow not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(slideshow);
	} catch (error) {
		console.error("Error fetching slideshow:", error);
		return NextResponse.json(
			{ error: "Failed to fetch slideshow" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		const { id } = await params;
		const body = await request.json();

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const slideshow = await prisma.slideShow.update({
			where: { id: parseInt(id) },
			data: {
				title: body.title,
				imageUrl: body.imageUrl,
				isActive: body.isActive,
				order: body.order,
			},
		});

		return NextResponse.json(slideshow);
	} catch (error) {
		console.error("Error updating slideshow:", error);
		return NextResponse.json(
			{ error: "Failed to update slideshow" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const { id } = await params;

		await prisma.slideShow.delete({
			where: { id: parseInt(id) },
		});

		return NextResponse.json({ message: "Slideshow deleted" });
	} catch (error) {
		console.error("Error deleting slideshow:", error);
		return NextResponse.json(
			{ error: "Failed to delete slideshow" },
			{ status: 500 }
		);
	}
}
