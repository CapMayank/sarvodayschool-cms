/** @format */

/**
 * SEO and Structured Data utilities for Sarvodaya School website
 */

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

// School organization structured data
export const schoolStructuredData = {
	"@context": "https://schema.org",
	"@type": "EducationalOrganization",
	name: "Sarvodaya School",
	description: "Quality education and disciplined environment for students",
	url: process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.co.in",
	telephone: "+91-8989646850", // Add your school's phone number
	email: "sarvodayaschool816@gmail.com", // Add your school's email
	address: {
		"@type": "PostalAddress",
		streetAddress: "Vinoba Bhave Ward no 05, College Road, Lakhnadon",
		addressLocality: "Lakhnadon",
		addressRegion: "Madhya Pradesh",
		postalCode: "480886",
		addressCountry: "IN",
	},
	sameAs: [
		// Add your school's social media profiles
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
