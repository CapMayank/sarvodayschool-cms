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
		"Providing quality education in Lakhnadon . A Commitment to Best Education and Discipline for a Better World",
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
