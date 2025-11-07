/** @format */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		default: "Sarvodaya School - Excellence in Education",
		template: "%s | Sarvodaya School",
	},
	description:
		"Sarvodaya School is committed to providing quality education and disciplined environment for students. Explore our results, facilities, environment, admission process, and more.",
	keywords: [
		"Sarvodaya School",
		"education",
		"school admission",
		"student results",
		"quality education",
		"academic excellence",
		"school facilities",
		"extracurricular activities",
	],
	authors: [{ name: "Sarvodaya School" }],
	creator: "Sarvodaya School",
	publisher: "Sarvodaya School",
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
		title: "Sarvodaya School - Excellence in Education",
		description:
			"Sarvodaya School is committed to providing quality education and disciplined environment for students.",
		url: process.env.NEXT_PUBLIC_SITE_URL || "https://sarvodayaschool.co.in",
		siteName: "Sarvodaya School",
		locale: "en_IN",
		type: "website",
		images: [
			{
				url: "/bg.jpg", // You can add this image to your public folder
				width: 1200,
				height: 630,
				alt: "Sarvodaya School",
			},
		],
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
