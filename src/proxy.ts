/** @format */

// /** @format */

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function proxy(request: NextRequest) {
// 	const session = request.cookies.get("better-auth.session_token");
// 	const { pathname } = request.nextUrl;

// 	const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
// 	const isPublicRoute = publicRoutes.some((route) =>
// 		pathname.startsWith(route)
// 	);

// 	if (!session && !isPublicRoute) {
// 		return NextResponse.redirect(new URL("/login", request.url));
// 	}

// 	if (session && isPublicRoute) {
// 		return NextResponse.redirect(new URL("/dashboard", request.url));
// 	}

// 	return NextResponse.next();
// }

// export const config = {
// 	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

/** @format */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
	const session = request.cookies.get("better-auth.session_token");
	const { pathname } = request.nextUrl;

	// Skip auth check for API routes and static files
	if (
		pathname.startsWith("/api/") ||
		pathname.startsWith("/_next/") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// Public website pages that don't require auth
	const publicRoutes = [
		"/",
		"/about",
		"/contact",
		"/careers",
		"/admission",
		"/gallery",
		"/result",
	];

	// Auth pages that should redirect to dashboard if logged in
	const authPages = ["/login", "/forgot-password", "/reset-password"];

	const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));
	const isAuthPage = authPages.some((r) => pathname.startsWith(r));

	// No session - redirect to login except for public/auth pages
	if (!session && !isPublicRoute && !isAuthPage) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Has session - redirect auth pages to dashboard
	if (session && isAuthPage) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all paths except static files and api routes
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
