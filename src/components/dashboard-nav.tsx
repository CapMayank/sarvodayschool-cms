/** @format */
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetClose,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
	Menu,
	ChevronDown,
	Home,
	LayoutDashboard,
	User,
	Trophy,
	Newspaper,
	Image,
	Presentation,
	Award,
	FileText,
	Users,
	LogOut,
	GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardNav({ session }: { session: any }) {
	const router = useRouter();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	const navigationGroups = {
		single: [
			{ href: "/", label: "Home", icon: Home },
			{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
			{ href: "/dashboard/user", label: "User", icon: User },
			{ href: "/dashboard/result", label: "Result", icon: GraduationCap },
		],
		contentManagement: {
			label: "Content Management",
			items: [
				{ href: "/dashboard/news", label: "News", icon: Newspaper },
				{ href: "/dashboard/gallery", label: "Gallery", icon: Image },
				{
					href: "/dashboard/slideshow",
					label: "Slideshow",
					icon: Presentation,
				},
				{ href: "/dashboard/achievements", label: "Achievements", icon: Award },
			],
		},
		forms: {
			label: "Forms & Applications",
			items: [
				{
					href: "/dashboard/admission-form",
					label: "Admission Form",
					icon: FileText,
				},
				{
					href: "/dashboard/teacher-recruitment",
					label: "Recruitment",
					icon: Users,
				},
			],
		},
	};

	const handleLogout = async () => {
		try {
			await authClient.signOut();
			toast.success("Logged out");
			router.push("/login");
		} catch {
			toast.error("Logout failed");
		}
	};

	const isGroupActive = (items: { href: string; label: string }[]) => {
		return items.some((item) => pathname === item.href);
	};

	return (
		<nav className="bg-white border-b shadow-sm sticky top-0 z-50">
			<div className="max-w-[1400px] mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Brand */}
					<h1 className="text-lg sm:text-xl font-bold text-slate-900">
						Sarvodaya CMS
					</h1>

					{/* Desktop Nav */}
					<div className="hidden lg:flex gap-1">
						{/* Single Navigation Items */}
						{navigationGroups.single.map((link) => {
							const active = pathname === link.href;
							return (
								<Link key={link.href} href={link.href}>
									<Button
										variant="ghost"
										className={`text-sm font-medium rounded-lg px-4 py-2 transition ${
											active
												? "bg-slate-100 text-primary font-semibold"
												: "text-slate-700 hover:bg-slate-100"
										}`}
									>
										{link.label}
									</Button>
								</Link>
							);
						})}

						{/* Content Management Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className={`text-sm font-medium rounded-lg px-4 py-2 transition flex items-center gap-1 ${
										isGroupActive(navigationGroups.contentManagement.items)
											? "bg-slate-100 text-primary font-semibold"
											: "text-slate-700 hover:bg-slate-100"
									}`}
								>
									{navigationGroups.contentManagement.label}
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{navigationGroups.contentManagement.items.map((item) => (
									<DropdownMenuItem key={item.href} asChild>
										<Link
											href={item.href}
											className={`w-full ${
												pathname === item.href ? "font-semibold" : ""
											}`}
										>
											{item.label}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Forms & Applications Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className={`text-sm font-medium rounded-lg px-4 py-2 transition flex items-center gap-1 ${
										isGroupActive([
											...navigationGroups.forms.items,
											...(session.user.role === "admin"
												? [{ href: "/dashboard/users", label: "Users" }]
												: []),
										])
											? "bg-slate-100 text-primary font-semibold"
											: "text-slate-700 hover:bg-slate-100"
									}`}
								>
									{navigationGroups.forms.label}
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{navigationGroups.forms.items.map((item) => (
									<DropdownMenuItem key={item.href} asChild>
										<Link
											href={item.href}
											className={`w-full ${
												pathname === item.href ? "font-semibold" : ""
											}`}
										>
											{item.label}
										</Link>
									</DropdownMenuItem>
								))}
								{session.user.role === "admin" && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link
												href="/dashboard/users"
												className={`w-full ${
													pathname === "/dashboard/users" ? "font-semibold" : ""
												}`}
											>
												Users Management
											</Link>
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Right Side */}
					<div className="flex items-center gap-2">
						{/* User Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="flex gap-2 px-2">
									<Avatar className="h-8 w-8">
										<AvatarFallback>
											{session.user?.name?.[0]?.toUpperCase() ||
												session.user.email[0].toUpperCase()}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Account</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem disabled>
									{session.user.email}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout}>
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Mobile Trigger */}
						<Sheet open={isOpen} onOpenChange={setIsOpen}>
							<SheetTrigger asChild className="lg:hidden">
								<Button variant="ghost" size="icon">
									<Menu className="h-6 w-6" />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-[280px] p-0">
								<SheetHeader className="px-6 py-4 border-b bg-slate-50">
									<SheetTitle className="text-left text-lg font-bold text-slate-900">
										Navigation Menu
									</SheetTitle>
									<SheetDescription className="text-left text-sm text-slate-600">
										{session.user.name || session.user.email}
									</SheetDescription>
								</SheetHeader>

								<div className="px-4 py-6 space-y-6">
									{/* Quick Actions */}
									<div className="space-y-1">
										<h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
											Quick Access
										</h3>
										{navigationGroups.single.map((item) => {
											const Icon = item.icon;
											return (
												<SheetClose asChild key={item.href}>
													<Link
														href={item.href}
														className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
															pathname === item.href
																? "bg-slate-100 text-slate-900 font-semibold"
																: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
														}`}
													>
														<Icon className="h-5 w-5" />
														{item.label}
													</Link>
												</SheetClose>
											);
										})}
									</div>

									{/* Content Management */}
									<div className="space-y-1">
										<h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
											{navigationGroups.contentManagement.label}
										</h3>
										{navigationGroups.contentManagement.items.map((item) => {
											const Icon = item.icon;
											return (
												<SheetClose asChild key={item.href}>
													<Link
														href={item.href}
														className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
															pathname === item.href
																? "bg-slate-100 text-slate-900 font-semibold"
																: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
														}`}
													>
														<Icon className="h-5 w-5" />
														{item.label}
													</Link>
												</SheetClose>
											);
										})}
									</div>

									{/* Forms & Applications */}
									<div className="space-y-1">
										<h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
											{navigationGroups.forms.label}
										</h3>
										{navigationGroups.forms.items.map((item) => {
											const Icon = item.icon;
											return (
												<SheetClose asChild key={item.href}>
													<Link
														href={item.href}
														className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
															pathname === item.href
																? "bg-slate-100 text-slate-900 font-semibold"
																: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
														}`}
													>
														<Icon className="h-5 w-5" />
														{item.label}
													</Link>
												</SheetClose>
											);
										})}
									</div>

									{/* Admin Section */}
									{session.user.role === "admin" && (
										<div className="space-y-1">
											<h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
												Administration
											</h3>
											<SheetClose asChild>
												<Link
													href="/dashboard/users"
													className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
														pathname === "/dashboard/users"
															? "bg-slate-100 text-slate-900 font-semibold"
															: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
													}`}
												>
													<Users className="h-5 w-5" />
													Users
												</Link>
											</SheetClose>
										</div>
									)}
								</div>

								{/* Logout Button */}
								<div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-slate-50">
									<Button
										onClick={handleLogout}
										variant="outline"
										className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
									>
										<LogOut className="h-4 w-4" />
										Logout
									</Button>
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</nav>
	);
}
