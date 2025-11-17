/** @format */

export const metadata = {
	title: "Contact Us",
	description:
		"Get in touch with Sarvodaya English Higher Secondary School Lakhnadon for admission inquiries, academic details, and general assistance. Reach out via phone, email, or visit our campus in Lakhnadon, Seoni district, Madhya Pradesh.",
	keywords: [
		"Contact Sarvodaya School",
		"School address Lakhnadon",
		"School phone number",
		"School location Seoni district",
		"Admission inquiry",
		"School contact details",
		"Visit school campus",
	],
	openGraph: {
		title: "Contact Us | Sarvodaya English Higher Secondary School Lakhnadon",
		description:
			"Get in touch with us for admission inquiries, academic details, and general assistance. Located in Lakhnadon, Seoni district, Madhya Pradesh.",
		type: "website",
	},
	alternates: {
		canonical: "/contact",
	},
};

export default function AdmissionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
