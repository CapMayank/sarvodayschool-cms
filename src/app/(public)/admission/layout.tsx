/** @format */

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
	"Admission",
	"Apply for admissions at Sarvodaya English Higher Secondary School Lakhnadon. Nursery to Class 12 admissions open. Discover our admission process, requirements, and important dates.",
	[
		"School admissions Lakhnadon",
		"Admission process",
		"Nursery admission Lakhnadon",
		"Class 12 admission",
		"MP Board school admission",
		"English medium school admission",
		"School enrollment Lakhnadon",
		"Best school admissions Seoni district",
	],
	"/admission"
);

export default function AdmissionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
