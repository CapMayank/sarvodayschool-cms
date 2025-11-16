/** @format */

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.co.in";

	// Static public pages with highest priority
	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/admission`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/result`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/result/search`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/careers`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/gallery`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		},
	];

	// Facility pages - using actual facility IDs from facilities.js
	const facilities = [
		"assembly-ground",
		"smart-classrooms",
		"laboratories",
		"monthly-awards",
		"parents-meeting",
	];

	const facilityRoutes: MetadataRoute.Sitemap = facilities.map((facility) => ({
		url: `${baseUrl}/facilities/${facility}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.6,
	}));

	// Dynamic gallery category pages from database
	let galleryRoutes: MetadataRoute.Sitemap = [];
	try {
		const galleryCategories = await prisma.galleryCategory.findMany({
			select: { name: true, updatedAt: true },
			orderBy: { order: "asc" },
		});

		galleryRoutes = galleryCategories.map((category) => ({
			url: `${baseUrl}/gallery/${category.name}`,
			lastModified: category.updatedAt || new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.5,
		}));
	} catch (error) {
		console.error("Error fetching gallery categories for sitemap:", error);
		// Fallback to common gallery categories if database is not accessible
		const fallbackCategories = [
			"academics",
			"sports",
			"cultural-events",
			"activities",
			"achievements",
		];

		galleryRoutes = fallbackCategories.map((category) => ({
			url: `${baseUrl}/gallery/${category}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.5,
		}));
	}

	// Dynamic news pages from database
	let newsRoutes: MetadataRoute.Sitemap = [];
	try {
		const newsItems = await prisma.news.findMany({
			where: { isPublished: true },
			select: { slug: true, updatedAt: true },
			orderBy: { publishDate: "desc" },
		});

		newsRoutes = newsItems.map((news) => ({
			url: `${baseUrl}/news/${news.slug}`,
			lastModified: news.updatedAt || new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		}));
	} catch (error) {
		console.error("Error fetching news for sitemap:", error);
	}

	// News listing page
	const newsListingRoute: MetadataRoute.Sitemap = [
		{
			url: `${baseUrl}/news`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
	];

	// Authentication pages (lower priority as they're not for SEO)
	const authRoutes: MetadataRoute.Sitemap = [
		{
			url: `${baseUrl}/login`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.1,
		},
		{
			url: `${baseUrl}/forgot-password`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.1,
		},
		{
			url: `${baseUrl}/reset-password`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.1,
		},
	];

	return [
		...staticRoutes,
		...facilityRoutes,
		...galleryRoutes,
		...newsListingRoute,
		...newsRoutes,
		...authRoutes,
	];
}
