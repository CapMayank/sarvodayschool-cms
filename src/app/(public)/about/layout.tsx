/** @format */

export const metadata = {
	title: "About Us",
	description:
		"Learn about Sarvodaya English Higher Secondary School Lakhnadon, established in 2002. Our mission is to provide the best education with strong discipline and moral values, focusing on complete development through academics and co-curricular activities.",
	keywords: [
		"About Sarvodaya School",
		"School history Lakhnadon",
		"Established 2002",
		"Value-based education",
		"School mission and vision",
		"Complete development",
		"Educational philosophy",
		"Best school in Lakhnadon",
	],
	openGraph: {
		title: "About Us | Sarvodaya English Higher Secondary School Lakhnadon",
		description:
			"Established in 2002, we are committed to providing the best education with strong discipline and moral values. Learn about our mission and educational philosophy.",
		type: "website",
	},
	alternates: {
		canonical: "/about",
	},
};

export default function AboutLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
