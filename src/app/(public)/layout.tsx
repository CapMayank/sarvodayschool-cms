/** @format */

import Navbar from "@/components/public/navbar";
import Script from "next/script"; // Import next/script
import "./globals.css";

export const metadata = {
	title: {
		default: "Sarvodaya English Higher Secondary School Lakhnadon",
		template: "%s | Sarvodaya English Higher Secondary School Lakhnadon",
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
		title: "Sarvodaya English Higher Secondary School Lakhnadon",
		description:
			"Premier English-medium institution from Nursery to Class 12. Committed to quality education, strong discipline, and moral values in Lakhnadon.",
		type: "website",
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
