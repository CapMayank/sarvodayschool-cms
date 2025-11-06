/** @format */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
