/** @format */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.edu.in";

	return {
		rules: [
			{
				userAgent: "*",
				allow: [
					"/",
					"/about",
					"/admission",
					"/result",
					"/result/search",
					"/contact",
					"/careers",
					"/gallery",
					"/gallery/*",
					"/facilities",
					"/facilities/*",
				],
				disallow: [
					"/dashboard/*",
					"/login",
					"/forgot-password",
					"/reset-password",
					"/create-admin",
					"/test-signup",
					"/api/*",
					"/_next/*",
					"/admin/*",
				],
			},
			// Specific rules for search engine bots
			{
				userAgent: "Googlebot",
				allow: [
					"/",
					"/about",
					"/admission",
					"/result",
					"/contact",
					"/careers",
					"/gallery",
					"/gallery/*",
					"/facilities",
					"/facilities/*",
				],
				disallow: ["/dashboard/*", "/api/*", "/login", "/admin/*"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	};
}
