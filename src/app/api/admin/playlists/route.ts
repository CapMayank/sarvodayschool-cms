/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET all playlists
export async function GET(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const playlists = await prisma.playlistVideo.findMany({
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ playlists });
	} catch (error) {
		console.error("Error fetching playlists:", error);
		return NextResponse.json(
			{ error: "Failed to fetch playlists" },
			{ status: 500 }
		);
	}
}

// POST - Create new playlist
export async function POST(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { youtubeId, title } = body;

		if (!youtubeId || !title) {
			return NextResponse.json(
				{ error: "YouTube ID and title are required" },
				{ status: 400 }
			);
		}

		const maxOrder = await prisma.playlistVideo.findFirst({
			orderBy: { order: "desc" },
			select: { order: true },
		});

		const playlist = await prisma.playlistVideo.create({
			data: {
				youtubeId,
				title,
				order: (maxOrder?.order ?? -1) + 1,
			},
		});

		return NextResponse.json({ playlist }, { status: 201 });
	} catch (error: any) {
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "Playlist already exists" },
				{ status: 400 }
			);
		}
		console.error("Error creating playlist:", error);
		return NextResponse.json(
			{ error: "Failed to create playlist" },
			{ status: 500 }
		);
	}
}

// PUT - Reorder playlists
export async function PUT(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { playlists } = body;

		if (!Array.isArray(playlists)) {
			return NextResponse.json(
				{ error: "Invalid playlists format" },
				{ status: 400 }
			);
		}

		const updated = await Promise.all(
			playlists.map((playlist: any, index: number) =>
				prisma.playlistVideo.update({
					where: { id: playlist.id },
					data: { order: index },
				})
			)
		);

		return NextResponse.json({ playlists: updated });
	} catch (error) {
		console.error("Error reordering playlists:", error);
		return NextResponse.json(
			{ error: "Failed to reorder playlists" },
			{ status: 500 }
		);
	}
}
