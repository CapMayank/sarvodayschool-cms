/** @format */

export const metadata = {
	title: "Careers",
	description:
		"Join our team at Sarvodaya English Higher Secondary School Lakhnadon. Teaching positions available for dedicated educators committed to quality education and student development. Apply now for career opportunities.",
	keywords: [
		"Teaching jobs Lakhnadon",
		"School careers",
		"Teacher recruitment Lakhnadon",
		"Education jobs Seoni district",
		"School vacancies",
		"Teaching positions Madhya Pradesh",
		"Join Sarvodaya School",
	],
	openGraph: {
		title: "Careers | Sarvodaya English Higher Secondary School Lakhnadon",
		description:
			"Join our team of dedicated educators. Teaching positions available at premier English-medium school in Lakhnadon. Apply now for career opportunities.",
		type: "website",
	},
	alternates: {
		canonical: "/careers",
	},
};

export default function CareersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
