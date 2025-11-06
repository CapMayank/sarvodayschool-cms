/** @format */

// /** @format */

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { authClient } from "@/lib/auth-client";
// import { Button } from "@/components/ui/button";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuLabel,
// 	DropdownMenuSeparator,
// 	DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
// 	Sheet,
// 	SheetContent,
// 	SheetTrigger,
// 	SheetClose,
// } from "@/components/ui/sheet";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
// import { toast } from "sonner";
// import { Menu, X } from "lucide-react";

// interface User {
// 	id: string;
// 	email: string;
// 	name: string | null;
// 	role: string;
// }

// interface Session {
// 	session: {
// 		userId: string;
// 		expiresAt: Date;
// 	};
// 	user: User;
// }

// interface DashboardNavProps {
// 	session: Session;
// }

// const navigationItems = [
// 	{ href: "/dashboard", label: "Dashboard" },
// 	{ href: "/dashboard/news", label: "News" },
// 	{ href: "/dashboard/slideshow", label: "Slideshow" },
// 	{ href: "/dashboard/gallery", label: "Gallery" },
// 	{ href: "/dashboard/achievements", label: "Achievements" },
// 	{ href: "/dashboard/result", label: "Result" },
// 	{ href: "/dashboard/admission-form", label: "Admission Form" },
// 	{ href: "/dashboard/teacher-recruitment", label: "Teacher Recruitment" },
// ];

// export default function DashboardNav({ session }: DashboardNavProps) {
// 	const router = useRouter();
// 	const [isOpen, setIsOpen] = useState(false);

// 	const handleLogout = async () => {
// 		try {
// 			await authClient.signOut();
// 			toast.success("Logged out successfully");
// 			router.push("/login");
// 			router.refresh();
// 		} catch (error) {
// 			toast.error("Failed to logout");
// 		}
// 	};

// 	const isAdmin = session.user.role === "admin";

// 	return (
// 		<nav className="bg-white shadow-sm border-b sticky top-0 z-50">
// 			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// 				<div className="flex justify-between h-16">
// 					{/* Left side - Logo and Desktop Nav */}
// 					<div className="flex items-center space-x-8">
// 						<h1 className="text-xl font-bold whitespace-nowrap">
// 							Admin Dashboard
// 						</h1>

// 						{/* Desktop Navigation */}
// 						<div className="hidden lg:flex space-x-1">
// 							{navigationItems.map((item) => (
// 								<Link key={item.href} href={item.href}>
// 									<Button variant="ghost" className="text-sm font-medium">
// 										{item.label}
// 									</Button>
// 								</Link>
// 							))}
// 							{isAdmin && (
// 								<Link href="/dashboard/users">
// 									<Button variant="ghost" className="text-sm font-medium">
// 										Users
// 									</Button>
// 								</Link>
// 							)}
// 						</div>
// 					</div>

// 					{/* Right side - User Menu and Mobile Toggle */}
// 					<div className="flex items-center space-x-2">
// 						{/* User Dropdown - Always visible */}
// 						<DropdownMenu>
// 							<DropdownMenuTrigger asChild>
// 								<Button variant="ghost" className="flex items-center gap-2">
// 									<Avatar className="h-8 w-8">
// 										<AvatarFallback className="text-xs">
// 											{session.user.name?.[0]?.toUpperCase() ||
// 												session.user.email[0].toUpperCase()}
// 										</AvatarFallback>
// 									</Avatar>
// 									<div className="hidden md:flex flex-col items-start">
// 										<span className="text-sm font-medium">
// 											{session.user.name || session.user.email}
// 										</span>
// 										<Badge variant="secondary" className="text-xs">
// 											{session.user.role}
// 										</Badge>
// 									</div>
// 								</Button>
// 							</DropdownMenuTrigger>
// 							<DropdownMenuContent align="end" className="w-56">
// 								<DropdownMenuLabel>My Account</DropdownMenuLabel>
// 								<DropdownMenuSeparator />
// 								<DropdownMenuItem disabled>
// 									{session.user.email}
// 								</DropdownMenuItem>
// 								<DropdownMenuSeparator />
// 								<DropdownMenuItem onClick={handleLogout}>
// 									Logout
// 								</DropdownMenuItem>
// 							</DropdownMenuContent>
// 						</DropdownMenu>

// 						{/* Mobile Menu Toggle */}
// 						<Sheet open={isOpen} onOpenChange={setIsOpen}>
// 							<SheetTrigger asChild className="lg:hidden">
// 								<Button variant="ghost" size="icon" aria-label="Toggle menu">
// 									<Menu className="h-6 w-6" />
// 								</Button>
// 							</SheetTrigger>
// 							<SheetContent side="right" className="w-[300px] sm:w-[350px]">
// 								<div className="flex flex-col space-y-4 mt-8">
// 									<div className="mb-4">
// 										<h2 className="text-lg font-bold">Navigation</h2>
// 										<p className="text-sm text-slate-500">
// 											{session.user.name || session.user.email}
// 										</p>
// 									</div>

// 									{navigationItems.map((item) => (
// 										<SheetClose asChild key={item.href}>
// 											<Link
// 												href={item.href}
// 												className="flex items-center py-3 px-4 text-base font-medium text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
// 											>
// 												{item.label}
// 											</Link>
// 										</SheetClose>
// 									))}

// 									{isAdmin && (
// 										<>
// 											<div className="border-t pt-4">
// 												<p className="px-4 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
// 													Admin Only
// 												</p>
// 												<SheetClose asChild>
// 													<Link
// 														href="/dashboard/users"
// 														className="flex items-center py-3 px-4 text-base font-medium text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
// 													>
// 														Users
// 													</Link>
// 												</SheetClose>
// 											</div>
// 										</>
// 									)}
// 								</div>
// 							</SheetContent>
// 						</Sheet>
// 					</div>
// 				</div>
// 			</div>
// 		</nav>
// 	);
// }

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
import { Menu } from "lucide-react";
import { toast } from "sonner";

export default function DashboardNav({ session }: any) {
	const router = useRouter();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	const links = [
		{ href: "/", label: "Home" },
		{ href: "/dashboard", label: "Dashboard" },
		{ href: "/dashboard/news", label: "News" },
		{ href: "/dashboard/gallery", label: "Gallery" },
		{ href: "/dashboard/slideshow", label: "Slideshow" },
		{ href: "/dashboard/achievements", label: "Achievements" },
		{ href: "/dashboard/result", label: "Result" },
		{ href: "/dashboard/admission-form", label: "Admission Form" },
		{ href: "/dashboard/teacher-recruitment", label: "Recruitment" },
	];

	const handleLogout = async () => {
		try {
			await authClient.signOut();
			toast.success("Logged out");
			router.push("/login");
		} catch {
			toast.error("Logout failed");
		}
	};

	const NavItem = ({ href, label }: any) => {
		const active = pathname === href;
		return (
			<Link href={href}>
				<Button
					variant="ghost"
					className={`text-sm font-medium rounded-lg px-4 py-2 transition ${
						active
							? "bg-slate-100 text-primary font-semibold"
							: "text-slate-700 hover:bg-slate-100"
					}`}
				>
					{label}
				</Button>
			</Link>
		);
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
						{links.map((link) => (
							<NavItem key={link.href} {...link} />
						))}
						{session.user.role === "admin" && (
							<NavItem href="/dashboard/users" label="Users" />
						)}
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
							<SheetContent side="left" className="w-[260px]">
								<SheetHeader>
									<SheetTitle>Navigation Menu</SheetTitle>
									<SheetDescription>
										Access dashboard pages and admin functions
									</SheetDescription>
								</SheetHeader>
								<div className="mt-6 space-y-2">
									<p className="font-semibold mb-3">
										{session.user.name || session.user.email}
									</p>

									{links.map((item) => (
										<SheetClose asChild key={item.href}>
											<Link
												href={item.href}
												className={`block px-3 py-2 rounded-md ${
													pathname === item.href
														? "bg-slate-200 font-semibold"
														: "hover:bg-slate-100"
												}`}
											>
												{item.label}
											</Link>
										</SheetClose>
									))}

									{session.user.role === "admin" && (
										<SheetClose asChild>
											<Link
												href="/dashboard/users"
												className={`block px-3 py-2 rounded-md ${
													pathname === "/dashboard/users"
														? "bg-slate-200 font-semibold"
														: "hover:bg-slate-100"
												}`}
											>
												Users
											</Link>
										</SheetClose>
									)}

									<Button
										onClick={handleLogout}
										className="w-full mt-4 bg-red-500 hover:bg-red-600"
									>
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
