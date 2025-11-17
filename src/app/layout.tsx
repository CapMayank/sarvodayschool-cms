/** @format */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		default:
			"Sarvodaya English Higher Secondary School Lakhnadon | Best School in Lakhnadon",
		template: "%s | Sarvodaya English Higher Secondary School Lakhnadon",
	},
	description:
		"Sarvodaya English Higher Secondary School, Lakhnadon, established in 2002. Premier English-medium institution from Nursery to Class 12. Committed to quality education, strong discipline, and moral values.",
	keywords: [
		"Sarvodaya English Higher Secondary School",
		"Sarvodaya School Lakhnadon",
		"Best school in Lakhnadon",
		"English medium school Lakhnadon",
		"Nursery to Class 12 school",
		"Higher secondary school Madhya Pradesh",
		"Value-based education India",
		"School admissions Lakhnadon",
		"Top schools in Seoni district",
		"Quality education Lakhnadon",
		"English medium school Seoni",
		"CBSE school Lakhnadon",
		"Academic excellence",
		"Discipline and moral values",
	],
	authors: [{ name: "Sarvodaya English Higher Secondary School Lakhnadon" }],
	creator: "Sarvodaya English Higher Secondary School Lakhnadon",
	publisher: "Sarvodaya English Higher Secondary School Lakhnadon",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.co.in"
	),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title:
			"Sarvodaya English Higher Secondary School Lakhnadon | Best School in Lakhnadon",
		description:
			"Premier English-medium institution from Nursery to Class 12. Established in 2002. Committed to quality education, strong discipline, and moral values in Lakhnadon, Madhya Pradesh.",
		url: process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.co.in",
		siteName: "Sarvodaya English Higher Secondary School Lakhnadon",
		locale: "en_IN",
		type: "website",
		images: [
			{
				url: "/bg.jpg",
				width: 1200,
				height: 630,
				alt: "Sarvodaya English Higher Secondary School Lakhnadon",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title:
			"Sarvodaya English Higher Secondary School Lakhnadon | Best School in Lakhnadon",
		description:
			"Premier English-medium institution from Nursery to Class 12. Committed to quality education, strong discipline, and moral values.",
		images: ["/bg.jpg"],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				{/* Google Analytics using next/script */}
				<Script
					strategy="afterInteractive"
					src="https://www.googletagmanager.com/gtag/js?id=G-MCB7FZGZKK"
				/>
				<Script
					id="google-analytics"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MCB7FZGZKK');
            `,
					}}
				/>
			</head>
			<body className={inter.className}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
