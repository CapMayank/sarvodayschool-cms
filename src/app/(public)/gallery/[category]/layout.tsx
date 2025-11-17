/** @format */

import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createDynamicMetadata } from "@/lib/seo";

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

		if (!categoryData) {
			return {
				title: `${category.replace(/_/g, " ")} Gallery`,
				description: `View ${category.replace(
					/_/g,
					" "
				)} photos from Sarvodaya English Higher Secondary School Lakhnadon.`,
			};
		}

		return createDynamicMetadata(
			`${categoryData.title} Gallery`,
			`${categoryData.description} View photos from ${categoryData.title} at Sarvodaya English Higher Secondary School Lakhnadon.`,
			`/gallery/${category}`,
			{
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
			}
		);
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
