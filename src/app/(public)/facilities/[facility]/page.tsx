/** @format */

import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createDynamicMetadata, BASE_URL } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import FacilityPage from "@/components/public/faciltyPage";

interface PageProps {
	params: Promise<{
		facility: string;
	}>;
}

// Generate static params for all facilities
export async function generateStaticParams() {
	const facilities = await prisma.facility.findMany({
		where: { isActive: true },
		select: { slug: true },
	});

	return facilities.map((facility) => ({
		facility: facility.slug,
	}));
}

// Generate dynamic metadata for each facility
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { facility: facilitySlug } = await params;
	const facility = await prisma.facility.findUnique({
		where: { slug: facilitySlug },
	});

	if (!facility) {
		return {
			title: "Facility Not Found",
		};
	}

	return createDynamicMetadata(
		facility.title,
		`${facility.description} Explore ${facility.title} at Sarvodaya English Higher Secondary School Lakhnadon.`,
		`/facilities/${facilitySlug}`,
		{
			keywords: [
				facility.title,
				"School facilities Lakhnadon",
				"School infrastructure",
				"Educational facilities",
				"Modern classrooms",
				"School amenities Lakhnadon",
				"Best school facilities Seoni",
			],
			image: facility.imageUrl ? `${BASE_URL}${facility.imageUrl}` : undefined,
			imageAlt: facility.title,
		}
	);
}

export default async function Facilities({ params }: PageProps) {
	const { facility: facilitySlug } = await params;

	// Retrieve the facility data using the dynamic route parameter
	const facility = await prisma.facility.findUnique({
		where: { slug: facilitySlug, isActive: true },
	});

	// Pass the facility data to the component
	if (!facility) {
		notFound();
	}

	// Transform the data to match the expected format
	const facilityData = {
		id: facility.slug,
		title: facility.title,
		imageUrl: facility.imageUrl,
		description: facility.description,
		highlights: facility.highlights as any,
		facilityFeatures: facility.facilityFeatures as any,
		mediaGallery: facility.mediaGallery as any,
	};

	return <FacilityPage facility={facilityData} />;
}
