/** @format */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PublicationGuardResult =
	| {
			ok: true;
			publication: {
				academicYear: string;
				publishDate: Date;
				isPublished: boolean;
			};
	  }
	| {
			ok: false;
			response: NextResponse;
	  };

export async function ensureResultPublicationAccess(
	academicYear: string,
): Promise<PublicationGuardResult> {
	if (!academicYear) {
		return {
			ok: false,
			response: NextResponse.json(
				{ error: "Academic year is required" },
				{ status: 400 },
			),
		};
	}

	const publication = await prisma.resultPublication.findUnique({
		where: { academicYear },
		select: {
			academicYear: true,
			publishDate: true,
			isPublished: true,
		},
	});

	if (!publication) {
		return {
			ok: false,
			response: NextResponse.json(
				{ error: "Results not available for this academic year" },
				{ status: 404 },
			),
		};
	}

	const now = new Date();
	const publishDate = new Date(publication.publishDate);
	const canAccess = publication.isPublished && now >= publishDate;

	if (!canAccess) {
		return {
			ok: false,
			response: NextResponse.json(
				{
					error: "Results are not yet published",
					publishDate: publication.publishDate,
				},
				{ status: 403 },
			),
		};
	}

	return {
		ok: true,
		publication,
	};
}
