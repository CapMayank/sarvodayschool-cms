/** @format */

export const metadata = {
	title: "Admission",
	description:
		"Apply for admissions at Sarvodaya English Higher Secondary School Lakhnadon. Nursery to Class 12 admissions open. Discover our admission process, requirements, and important dates.",
	keywords: [
		"School admissions Lakhnadon",
		"Admission process",
		"Nursery admission Lakhnadon",
		"Class 12 admission",
		"MP Board school admission",
		"English medium school admission",
		"School enrollment Lakhnadon",
		"Best school admissions Seoni district",
	],
	openGraph: {
		title: "Admission | Sarvodaya English Higher Secondary School Lakhnadon",
		description:
			"Apply for admissions from Nursery to Class 12. English-medium school in Lakhnadon. Learn about our admission process and requirements.",
		type: "website",
	},
	alternates: {
		canonical: "/admission",
	},
};

export default function AdmissionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
