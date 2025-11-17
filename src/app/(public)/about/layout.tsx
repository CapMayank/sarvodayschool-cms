/** @format */

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
	"About Us",
	"Learn about Sarvodaya English Higher Secondary School Lakhnadon, established in 2002. Our mission is to provide the best education with strong discipline and moral values, focusing on complete development through academics and co-curricular activities.",
	[
		"About Sarvodaya School",
		"School history Lakhnadon",
		"Established 2002",
		"Value-based education",
		"School mission and vision",
		"Complete development",
		"Educational philosophy",
	],
	"/about"
);

export default function AboutLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
