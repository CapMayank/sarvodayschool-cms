/** @format */

import { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
	title: "Search Results",
	description:
		"Search and view student examination results at Sarvodaya English Higher Secondary School Lakhnadon. Check Annual Examination results by roll number or enrollment number.",
	keywords: [
		"Search results",
		"Student results search",
		"Roll number search",
		"Enrollment number search",
		"MP Board results Lakhnadon",
		"Student result finder",
	],
	noIndex: true,
});

export default function ResultSearchLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
