/** @format */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Sarvodaya CMS Dashboard",
	description:
		"Admin Dashboard for Sarvodaya English Higher Secondary School CMS",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{children}
			<Toaster />
		</>
	);
}
