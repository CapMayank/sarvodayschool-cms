/** @format */

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Maintenance",
	description:
		"The website is temporarily unavailable while scheduled maintenance is in progress.",
};

export default function MaintenancePage() {
	return (
		<main className="min-h-screen flex items-center justify-center px-6 py-16 bg-background text-foreground">
			<div className="max-w-xl text-center space-y-4">
				<p className="text-sm tracking-wide uppercase text-muted-foreground">
					Scheduled Maintenance
				</p>
				<h1 className="text-3xl sm:text-4xl font-semibold">
					We&rsquo;ll be back shortly
				</h1>
				<p className="text-base text-muted-foreground">
					Our website is temporarily offline for updates. Thank you for your
					patience.
				</p>
			</div>
		</main>
	);
}