/** @format */

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
	"Careers",
	"Join our team at Sarvodaya English Higher Secondary School Lakhnadon. Teaching positions available for dedicated educators committed to quality education and student development. Apply now for career opportunities.",
	[
		"Teaching jobs Lakhnadon",
		"School careers",
		"Teacher recruitment Lakhnadon",
		"Education jobs Seoni district",
		"School vacancies",
		"Teaching positions Madhya Pradesh",
		"Join Sarvodaya School",
	],
	"/careers"
);

export default function CareersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
