/** @format */

import React from "react";
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createDynamicMetadata, BASE_URL } from "@/lib/seo";
import facilities from "@/lib/facilities/facilities";
import FacilityPage from "@/components/public/faciltyPage";

interface PageProps {
	params: Promise<{
		facility: string;
	}>;
}

// Generate static params for all facilities
export async function generateStaticParams() {
	return facilities.map((facility) => ({
		facility: facility.id,
	}));
}

// Generate dynamic metadata for each facility
export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { facility: facilityId } = await params;
	const facility = facilities.find((f) => f.id === facilityId);

	if (!facility) {
		return {
			title: "Facility Not Found",
		};
	}

	return createDynamicMetadata(
		facility.title,
		`${facility.description} Explore ${facility.title} at Sarvodaya English Higher Secondary School Lakhnadon.`,
		`/facilities/${facilityId}`,
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
	const { facility: facilityId } = await params;

	// Retrieve the facility data using the dynamic route parameter
	const facility = facilities.find((f) => f.id === facilityId);

	// Pass the facility data to the component
	if (!facility) {
		notFound();
	}

	return <FacilityPage facility={facility} />;
}
