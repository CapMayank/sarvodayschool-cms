/** @format */

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
	"Results",
	"Check latest MP Board examination results and academic achievers at Sarvodaya English Higher Secondary School Lakhnadon. View Class 10th, 12th, and other class results with toppers list.",
	[
		"School results Lakhnadon",
		"Sarvodaya School results",
		"Annual Examination results",
		"All class results",
		"MP Board results",
		"Class 10th results",
		"Class 12th results",
		"Exam results",
		"Academic achievers",
		"Toppers list",
		"Examination results Lakhnadon",
	],
	"/result"
);

export default function ResultLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
