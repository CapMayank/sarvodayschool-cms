/** @format */

import Navbar from "@/components/public/navbar";
import Script from "next/script";
import { SITE_NAME, SITE_NAME_SHORT, DEFAULT_IMAGE } from "@/lib/seo";
import "./globals.css";

export const metadata = {
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	description:
		"Sarvodaya English Higher Secondary School Lakhnadon - Providing quality education from Nursery to Class 12 with strong discipline and moral values since 2002.",
	keywords: [
		"Sarvodaya School Lakhnadon",
		"Best school in Lakhnadon",
		"English medium school Lakhnadon",
		"Nursery to Class 12",
		"Quality education",
		"School admissions Lakhnadon",
	],
	openGraph: {
		title: SITE_NAME,
		description:
			"Best School in Lakhnadon from Nursery to Class 12. Committed to quality education, strong discipline, and moral values in Lakhnadon.",
		type: "website",
		images: [
			{
				url: DEFAULT_IMAGE,
				secureUrl: DEFAULT_IMAGE,
				width: 1200,
				height: 630,
				alt: SITE_NAME,
			},
		],
		locale: "en_IN",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navbar />
			{children}
		</>
	);
}
