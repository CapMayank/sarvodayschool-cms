/** @format */

import { Metadata } from "next";

/**
 * SEO and Structured Data utilities for Sarvodaya School website
 */

// Constants
export const SITE_NAME = "Sarvodaya English Higher Secondary School Lakhnadon";
export const SITE_NAME_SHORT = "Sarvodaya School Lakhnadon";
export const BASE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.co.in";
export const DEFAULT_IMAGE = `${BASE_URL}/bg.jpg`;

// Common keywords for the school
const COMMON_KEYWORDS = [
	"Sarvodaya School Lakhnadon",
	"Best school in Lakhnadon",
	"English medium school Lakhnadon",
	"Quality education",
	"Lakhnadon education",
];

export interface PageSEO {
	title: string;
	description: string;
	keywords?: string[];
	canonical?: string;
	openGraph?: {
		title?: string;
		description?: string;
		images?: Array<{
			url: string;
			width?: number;
			height?: number;
			alt?: string;
		}>;
	};
}

interface MetadataOptions {
	title: string;
	description: string;
	keywords?: string[];
	canonical?: string;
	image?: string;
	imageAlt?: string;
	type?: "website" | "article";
	publishedTime?: string;
	noIndex?: boolean;
}

/**
 * Generate optimized metadata for pages
 */
export function createMetadata({
	title,
	description,
	keywords = [],
	canonical,
	image,
	imageAlt,
	type = "website",
	publishedTime,
	noIndex = false,
}: MetadataOptions): Metadata {
	const fullTitle = `${title} | ${SITE_NAME}`;
	const ogImage = image || DEFAULT_IMAGE;
	const ogImageAlt = imageAlt || SITE_NAME;
	const allKeywords = [...COMMON_KEYWORDS, ...keywords];

	const metadata: Metadata = {
		title,
		description,
		keywords: allKeywords,
		...(noIndex && { robots: "noindex, nofollow" }),
		...(canonical && {
			alternates: {
				canonical: canonical.startsWith("http")
					? canonical
					: `${BASE_URL}${canonical}`,
			},
		}),
		openGraph: {
			title: fullTitle,
			description,
			url: canonical
				? canonical.startsWith("http")
					? canonical
					: `${BASE_URL}${canonical}`
				: undefined,
			images: [
				{
					url: ogImage,
					width: 1200,
					height: 630,
					alt: ogImageAlt,
					type: "image/jpeg",
				},
			],
			type,
			siteName: SITE_NAME,
			locale: "en_IN",
			...(type === "article" && publishedTime && { publishedTime }),
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
			images: [ogImage],
		},
	};

	return metadata;
}

/**
 * Generate metadata for static pages
 */
export function createPageMetadata(
	title: string,
	description: string,
	keywords: string[],
	path: string
): Metadata {
	return createMetadata({
		title,
		description,
		keywords,
		canonical: path,
	});
}

/**
 * Generate metadata for dynamic content (news, facilities, etc.)
 */
export function createDynamicMetadata(
	title: string,
	description: string,
	path: string,
	options: {
		keywords?: string[];
		image?: string;
		imageAlt?: string;
		type?: "website" | "article";
		publishedTime?: string;
	} = {}
): Metadata {
	return createMetadata({
		title,
		description,
		canonical: path,
		...options,
	});
}

// School organization structured data
export const schoolStructuredData = {
	"@context": "https://schema.org",
	"@type": "EducationalOrganization",
	name: "Sarvodaya English Higher Secondary School",
	description: "Quality education and disciplined environment for students",
	url: BASE_URL,
	telephone: "+91-8989646850",
	email: "sarvodaya816@gmail.com",
	address: {
		"@type": "PostalAddress",
		streetAddress: "Vinoba Bhave Ward no 05, College Road, Lakhnadon",
		addressLocality: "Lakhnadon",
		addressRegion: "Madhya Pradesh",
		postalCode: "480886",
		addressCountry: "IN",
	},
	sameAs: [
		"https://www.facebook.com/people/Sarvodaya-English-Higher-Secondary-School-Lakhnadon/61559633950802/",
		"https://www.youtube.com/@sarvodayaschoollakhnadon",
	],
};

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(
	breadcrumbs: Array<{ name: string; url: string }>
) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbs.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: crumb.url,
		})),
	};
}
