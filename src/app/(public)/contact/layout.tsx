/** @format */

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
	"Contact Us",
	"Get in touch with Sarvodaya English Higher Secondary School Lakhnadon for admission inquiries, academic details, and general assistance. Reach out via phone, email, or visit our campus in Lakhnadon, Seoni district, Madhya Pradesh.",
	[
		"Contact Sarvodaya School",
		"School address Lakhnadon",
		"School phone number",
		"School location Seoni district",
		"Admission inquiry",
		"School contact details",
		"Visit school campus",
	],
	"/contact"
);

export default function AdmissionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
