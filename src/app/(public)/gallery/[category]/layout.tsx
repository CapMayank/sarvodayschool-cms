/** @format */

import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

// Generate static params for all gallery categories
export async function generateStaticParams() {
	try {
		const categories = await prisma.galleryCategory.findMany({
			select: { name: true },
		});

		return categories.map((cat) => ({
			category: cat.name,
		}));
	} catch (error) {
		console.error("Error generating static params for gallery:", error);
		return [];
	}
}

// Generate dynamic metadata for each gallery category
export async function generateMetadata({
	params,
}: {
	params: Promise<{ category: string }>;
}): Promise<Metadata> {
	const { category } = await params;

	try {
		const categoryData = await prisma.galleryCategory.findUnique({
			where: { name: category },
		});

		const baseUrl =
			process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.co.in";

		if (!categoryData) {
			return {
				title: `${category.replace(/_/g, " ")} Gallery`,
				description: `View ${category.replace(
					/_/g,
					" "
				)} photos from Sarvodaya English Higher Secondary School Lakhnadon.`,
			};
		}

		return {
			title: `${categoryData.title} Gallery`,
			description: `${categoryData.description} View photos from ${categoryData.title} at Sarvodaya English Higher Secondary School Lakhnadon.`,
			keywords: [
				categoryData.title,
				"School gallery",
				"School photos Lakhnadon",
				"School events",
				"Student activities",
				"School life Lakhnadon",
				"Educational events",
				"School memories",
			],
			alternates: {
				canonical: `${baseUrl}/gallery/${category}`,
			},
			openGraph: {
				title: `${categoryData.title} Gallery | Sarvodaya English Higher Secondary School Lakhnadon`,
				description: `${categoryData.description} View photos from ${categoryData.title}.`,
				url: `${baseUrl}/gallery/${category}`,
				type: "website",
				siteName: "Sarvodaya English Higher Secondary School Lakhnadon",
				locale: "en_IN",
			},
			twitter: {
				card: "summary_large_image",
				title: `${categoryData.title} Gallery | Sarvodaya School Lakhnadon`,
				description: categoryData.description,
			},
		};
	} catch (error) {
		console.error("Error generating gallery metadata:", error);
		return {
			title: `${category.replace(/_/g, " ")} Gallery`,
			description: `View ${category.replace(
				/_/g,
				" "
			)} photos from Sarvodaya English Higher Secondary School Lakhnadon.`,
		};
	}
}

export default function GalleryCategoryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
