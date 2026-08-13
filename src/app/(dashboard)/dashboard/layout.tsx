/** @format */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<div className="flex flex-col lg:flex-row min-h-screen bg-slate-50/50">
			{/* Mobile uses the header inside DashboardSidebar and places sidebar logic in a Sheet */}
			<DashboardSidebar session={session} />
			<main className="flex-1 max-w-[1600px] w-full min-w-0">
				<div className="p-4 sm:p-6 lg:p-8">
					{children}
				</div>
			</main>
		</div>
	);
}
