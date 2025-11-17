/** @format */

export const metadata = {
	title: "Results",
	description:
		"Check latest MP Board examination results and academic achievers at Sarvodaya English Higher Secondary School Lakhnadon. View Class 10th, 12th, and other class results with toppers list.",
	keywords: [
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
	openGraph: {
		title: "Results | Sarvodaya English Higher Secondary School Lakhnadon",
		description:
			"Check latest MP Board examination results and academic achievers. View Class 10th, 12th, and other class results with toppers list.",
		type: "website",
	},
	alternates: {
		canonical: "/result",
	},
};

export default function AdmissionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
