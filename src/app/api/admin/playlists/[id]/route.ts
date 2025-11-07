/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// PATCH - Update playlist
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { id: idParam } = await params;
		const id = parseInt(idParam);
		const body = await request.json();
		const { title, youtubeId } = body;

		const updated = await prisma.playlistVideo.update({
			where: { id },
			data: {
				...(title && { title }),
				...(youtubeId && { youtubeId }),
			},
		});

		return NextResponse.json({ playlist: updated });
	} catch (error: any) {
		if (error.code === "P2025") {
			return NextResponse.json(
				{ error: "Playlist not found" },
				{ status: 404 }
			);
		}
		console.error("Error updating playlist:", error);
		return NextResponse.json(
			{ error: "Failed to update playlist" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete playlist
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { id: idParam } = await params;
		const id = parseInt(idParam);

		await prisma.playlistVideo.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		if (error.code === "P2025") {
			return NextResponse.json(
				{ error: "Playlist not found" },
				{ status: 404 }
			);
		}
		console.error("Error deleting playlist:", error);
		return NextResponse.json(
			{ error: "Failed to delete playlist" },
			{ status: 500 }
		);
	}
}
