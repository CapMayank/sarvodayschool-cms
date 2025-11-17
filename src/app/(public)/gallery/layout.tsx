/** @format */

export const metadata = {
	title: "Gallery",
	description:
		"View photo gallery of Sarvodaya English Higher Secondary School Lakhnadon. Explore images of school events, facilities, achievements, co-curricular activities, and student life at our campus.",
	keywords: [
		"School gallery",
		"School photos Lakhnadon",
		"School events",
		"Campus images",
		"School activities",
		"Student life",
		"School achievements",
	],
	openGraph: {
		title: "Gallery | Sarvodaya English Higher Secondary School Lakhnadon",
		description:
			"Explore our photo gallery showcasing school events, facilities, achievements, and vibrant student life at Sarvodaya School Lakhnadon.",
		type: "website",
	},
	alternates: {
		canonical: "/gallery",
	},
};

export default function GalleryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
