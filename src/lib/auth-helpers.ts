/** @format */

import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function validateSession(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		return session;
	} catch (error) {
		console.error("Session validation error:", error);
		return null;
	}
}

export async function requireAuth(request: NextRequest) {
	const session = await validateSession(request);
	if (!session) {
		throw new Error("Unauthorized");
	}
	return session;
}

export async function requireAdmin(request: NextRequest) {
	const session = await requireAuth(request);
	if (!session.user) {
		throw new Error("Unauthorized");
	}
	// Add admin role check if you have role-based auth
	return session;
}
