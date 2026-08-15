"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	Home,
	LayoutDashboard,
	User,
	Newspaper,
	Image as ImageIcon,
	Presentation,
	Award,
	Building2,
	FileText,
	Users,
	LogOut,
	GraduationCap,
	ChevronLeft,
	ChevronRight,
	Menu,
	Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationGroups = [
	{
		label: "Main",
		items: [
			{ href: "/", label: "View Site", icon: Home },
			{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
		],
	},
	{
		label: "Content Management",
		items: [
			{ href: "/dashboard/news", label: "News & Events", icon: Newspaper },
			{ href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
			{ href: "/dashboard/slideshow", label: "Slideshows", icon: Presentation },
			{ href: "/dashboard/achievements", label: "Achievements", icon: Award },
			{ href: "/dashboard/facilities", label: "Facilities", icon: Building2 },
			{ href: "/dashboard/settings", label: "Site Settings", icon: Settings },
		],
	},
	{
		label: "Operations",
		items: [
			{ href: "/dashboard/admission-form", label: "Admissions", icon: FileText },
			{ href: "/dashboard/teacher-recruitment", label: "Recruitment", icon: Users },
			{ href: "/dashboard/result", label: "Results", icon: GraduationCap },
		],
	},
];

export default function DashboardSidebar({ session }: { session: any }) {
	const pathname = usePathname();
	const router = useRouter();
	const [collapsed, setCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1024);
			if (window.innerWidth < 1024) {
				setCollapsed(true);
			} else {
				setCollapsed(false);
			}
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const handleLogout = async () => {
		try {
			await authClient.signOut();
			toast.success("Logged out");
			router.push("/login");
		} catch {
			toast.error("Logout failed");
		}
	};

	const navContent = (
		<div className="flex flex-col h-full bg-white border-r">
			{/* Sidebar Header */}
			<div className="flex h-16 shrink-0 items-center justify-between px-4 border-b">
				<div className={cn("flex items-center gap-2", collapsed && !isMobile && "hidden")}>
					<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
						<span className="text-white font-bold text-lg">S</span>
					</div>
					<span className="font-bold text-lg tracking-tight text-slate-900">
						Sarvodaya CMS
					</span>
				</div>
				{!isMobile && (
					<Button
						variant="ghost"
						size="icon"
						className="ml-auto"
						onClick={() => setCollapsed(!collapsed)}
					>
						{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
					</Button>
				)}
			</div>

			{/* Sidebar Links */}
			<ScrollArea className="flex-1 py-4">
				<nav className="space-y-6 px-2">
					{navigationGroups.map((group, i) => (
						<div key={i} className="space-y-1">
							{(!collapsed || isMobile) && (
								<h4 className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
									{group.label}
								</h4>
							)}
							<div className="space-y-1">
								{group.items.map((item) => {
									const active = pathname === item.href;
									return (
										<Link key={item.href} href={item.href} onClick={() => isMobile && setSheetOpen(false)}>
											<Button
												variant={active ? "secondary" : "ghost"}
												className={cn(
													"w-full justify-start",
													active ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-100",
													collapsed && !isMobile ? "px-0 justify-center" : "px-4"
												)}
												title={collapsed && !isMobile ? item.label : undefined}
											>
												<item.icon className={cn("shrink-0", collapsed && !isMobile ? "h-5 w-5 m-0" : "h-4 w-4 mr-3")} />
												{(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
											</Button>
										</Link>
									);
								})}
							</div>
						</div>
					))}

					{/* Admin Section */}
					{session?.user?.role === "admin" && (
						<div className="space-y-1">
							{(!collapsed || isMobile) && (
								<h4 className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-4">
									Administration
								</h4>
							)}
							<Link href="/dashboard/users" onClick={() => isMobile && setSheetOpen(false)}>
								<Button
									variant={pathname === "/dashboard/users" ? "secondary" : "ghost"}
									className={cn(
										"w-full justify-start",
										pathname === "/dashboard/users" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-100",
										collapsed && !isMobile ? "px-0 justify-center" : "px-4"
									)}
									title={collapsed && !isMobile ? "Users" : undefined}
								>
									<User className={cn("shrink-0", collapsed && !isMobile ? "h-5 w-5 m-0" : "h-4 w-4 mr-3")} />
									{(!collapsed || isMobile) && <span className="truncate">Users</span>}
								</Button>
							</Link>
						</div>
					)}
				</nav>
			</ScrollArea>

			{/* Sidebar Footer */}
			<div className="p-4 border-t">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="w-full justify-start px-2 h-auto py-2 hover:bg-slate-100">
							<Avatar className="h-8 w-8 rounded-md shrink-0">
								<AvatarFallback className="bg-blue-100 text-blue-700 rounded-md">
									{session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
								</AvatarFallback>
							</Avatar>
							{(!collapsed || isMobile) && (
								<div className="ml-3 flex flex-col items-start truncate">
									<span className="text-sm font-medium text-slate-900 truncate w-full">
										{session?.user?.name || "User"}
									</span>
									<span className="text-xs text-slate-500 truncate w-full">
										{session?.user?.role}
									</span>
								</div>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">{session?.user?.name}</p>
								<p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
							<LogOut className="mr-2 h-4 w-4" />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);

	// Desktop Layout
	if (!isMobile) {
		return (
			<aside
				className={cn(
					"sticky top-0 h-screen shrink-0 transition-all duration-300 ease-in-out z-20 hidden lg:block",
					collapsed ? "w-20" : "w-64"
				)}
			>
				{navContent}
			</aside>
		);
	}

	// Mobile Layout (which includes the top header nav for mobile)
	return (
		<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6 shadow-sm lg:hidden">
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
						<Menu className="h-5 w-5" />
						<span className="sr-only">Toggle navigation menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-72 p-0">
					{navContent}
				</SheetContent>
			</Sheet>
			<div className="flex items-center gap-2">
				<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
					<span className="text-white font-bold text-lg">S</span>
				</div>
				<span className="font-bold text-lg tracking-tight text-slate-900">
					Sarvodaya CMS
				</span>
			</div>
			
			<div className="ml-auto">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="rounded-full">
							<Avatar className="h-8 w-8">
								<AvatarFallback className="bg-blue-100 text-blue-700">
									{session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">{session?.user?.name}</p>
								<p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
							<LogOut className="mr-2 h-4 w-4" />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
