/** @format */
import facilities from "@/lib/facilities/facilities";
import FacilityPage from "@/components/public/faciltyPage";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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

	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.co.in";

	return {
		title: facility.title,
		description: `${facility.description} Explore ${facility.title} at Sarvodaya English Higher Secondary School Lakhnadon.`,
		keywords: [
			facility.title,
			"School facilities Lakhnadon",
			"School infrastructure",
			"Educational facilities",
			"Modern classrooms",
			"School amenities Lakhnadon",
			"Best school facilities Seoni",
		],
		alternates: {
			canonical: `${baseUrl}/facilities/${facilityId}`,
		},
		openGraph: {
			title: `${facility.title} | Sarvodaya English Higher Secondary School Lakhnadon`,
			description: `${facility.description} Explore our world-class ${facility.title}.`,
			url: `${baseUrl}/facilities/${facilityId}`,
			images: facility.imageUrl ? [facility.imageUrl] : [],
			type: "website",
			siteName: "Sarvodaya English Higher Secondary School Lakhnadon",
			locale: "en_IN",
		},
		twitter: {
			card: "summary_large_image",
			title: `${facility.title} | Sarvodaya School Lakhnadon`,
			description: facility.description,
			images: facility.imageUrl ? [facility.imageUrl] : [],
		},
	};
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
