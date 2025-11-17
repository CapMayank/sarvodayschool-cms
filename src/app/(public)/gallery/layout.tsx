/** @format */

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata(
	"Gallery",
	"View photo gallery of Sarvodaya English Higher Secondary School Lakhnadon. Explore images of school events, facilities, achievements, co-curricular activities, and student life at our campus.",
	[
		"School gallery",
		"School photos Lakhnadon",
		"School events",
		"Campus images",
		"School activities",
		"Student life",
		"School achievements",
	],
	"/gallery"
);

export default function GalleryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
