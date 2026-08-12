/** @format */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
	Shield, 
	Mail, 
	Circle,
	Newspaper,
	Image as ImageIcon,
	Presentation,
	Award,
	Building2,
	FileText,
	Users,
	ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return null;
	}

	// Fetch quick stats directly from DB
	const [
		newsCount,
		achievementsCount,
		slideshowsCount,
		facilitiesCount,
		newAdmissionsCount,
		newTeacherAppsCount
	] = await Promise.all([
		prisma.news.count(),
		prisma.achievement.count(),
		prisma.slideShow.count(),
		prisma.facility.count(),
		prisma.admissionForm.count({ where: { status: "New" } }),
		prisma.teacherApplication.count({ where: { status: "New" } })
	]);

	const displayName = session.user.name || session.user.email;

	return (
		<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Enhanced Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight text-slate-900">
						Dashboard Overview
					</h1>
					<p className="text-slate-500 font-medium">
						Welcome back, {displayName}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Badge variant="outline" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200 capitalize flex items-center gap-1">
						<Shield className="w-3 h-3" />
						{session.user.role}
					</Badge>
					<Badge variant="outline" className="px-3 py-1 text-sm bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
						<Circle className="w-3 h-3 fill-emerald-500" />
						Active Session
					</Badge>
				</div>
			</div>

			{/* Quick Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="hover:shadow-md transition-all border-slate-100 bg-white">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-slate-600">Total News</CardTitle>
						<div className="p-2 bg-blue-50 rounded-lg">
							<Newspaper className="h-4 w-4 text-blue-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-slate-900">{newsCount}</div>
						<p className="text-xs text-slate-500 mt-1">Published articles</p>
					</CardContent>
				</Card>
				
				<Card className="hover:shadow-md transition-all border-slate-100 bg-white">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-slate-600">Active Banners</CardTitle>
						<div className="p-2 bg-indigo-50 rounded-lg">
							<Presentation className="h-4 w-4 text-indigo-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-slate-900">{slideshowsCount}</div>
						<p className="text-xs text-slate-500 mt-1">Homepage slideshows</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-all border-slate-100 bg-white">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-slate-600">Achievements</CardTitle>
						<div className="p-2 bg-orange-50 rounded-lg">
							<Award className="h-4 w-4 text-orange-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-slate-900">{achievementsCount}</div>
						<p className="text-xs text-slate-500 mt-1">School milestones</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-all border-slate-100 bg-white">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-slate-600">Facilities</CardTitle>
						<div className="p-2 bg-emerald-50 rounded-lg">
							<Building2 className="h-4 w-4 text-emerald-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-slate-900">{facilitiesCount}</div>
						<p className="text-xs text-slate-500 mt-1">Infrastructure entries</p>
					</CardContent>
				</Card>
			</div>

			{/* Actionable Sections */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Pending Tasks */}
				<Card className="border-slate-100 shadow-sm">
					<CardHeader>
						<CardTitle className="text-lg">Pending Tasks</CardTitle>
						<CardDescription>Forms requiring your attention</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-white rounded-lg shadow-sm">
									<FileText className="h-5 w-5 text-amber-600" />
								</div>
								<div>
									<h4 className="font-semibold text-slate-900">Admission Forms</h4>
									<p className="text-sm text-slate-500">{newAdmissionsCount} new submissions</p>
								</div>
							</div>
							<Button variant="ghost" asChild className="hover:bg-amber-100 text-amber-700">
								<Link href="/dashboard/admission-form">
									View <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>

						<div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-white rounded-lg shadow-sm">
									<Users className="h-5 w-5 text-purple-600" />
								</div>
								<div>
									<h4 className="font-semibold text-slate-900">Teacher Applications</h4>
									<p className="text-sm text-slate-500">{newTeacherAppsCount} new submissions</p>
								</div>
							</div>
							<Button variant="ghost" asChild className="hover:bg-purple-100 text-purple-700">
								<Link href="/dashboard/teacher-recruitment">
									View <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card className="border-slate-100 shadow-sm">
					<CardHeader>
						<CardTitle className="text-lg">Quick Actions</CardTitle>
						<CardDescription>Shortcuts to common tasks</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-3">
							<Button variant="outline" asChild className="h-24 flex-col gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200">
								<Link href="/dashboard/news">
									<Newspaper className="h-6 w-6 text-blue-600" />
									<span>Post News</span>
								</Link>
							</Button>
							<Button variant="outline" asChild className="h-24 flex-col gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200">
								<Link href="/dashboard/gallery">
									<ImageIcon className="h-6 w-6 text-pink-600" />
									<span>Add Photos</span>
								</Link>
							</Button>
							<Button variant="outline" asChild className="h-24 flex-col gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200">
								<Link href="/dashboard/slideshow">
									<Presentation className="h-6 w-6 text-indigo-600" />
									<span>Update Banner</span>
								</Link>
							</Button>
							{session.user.role === "admin" && (
								<Button variant="outline" asChild className="h-24 flex-col gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200">
									<Link href="/dashboard/users">
										<Shield className="h-6 w-6 text-slate-600" />
										<span>Manage Users</span>
									</Link>
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
