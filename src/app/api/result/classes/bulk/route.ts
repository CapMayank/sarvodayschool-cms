/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// POST - Bulk create classes
export async function POST(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { classes } = body;

		if (!classes || !Array.isArray(classes)) {
			return NextResponse.json(
				{ error: "Classes array is required" },
				{ status: 400 }
			);
		}

		// Validate each class
		for (const cls of classes) {
			if (!cls.name || !cls.displayName) {
				return NextResponse.json(
					{ error: "Name and display name are required for all classes" },
					{ status: 400 }
				);
			}
		}

		// Create classes in a transaction
		const results = await prisma.$transaction(async (tx) => {
			const createdClasses = [];

			for (const cls of classes) {
				try {
					const classData = await tx.class.create({
						data: {
							name: cls.name,
							displayName: cls.displayName,
							order: cls.order ?? 0,
						},
					});
					createdClasses.push(classData);
				} catch (error) {
					// Skip if already exists (unique constraint)
					if (
						error &&
						typeof error === "object" &&
						"code" in error &&
						error.code === "P2002"
					) {
						console.log(`Class ${cls.name} already exists, skipping`);
						continue;
					}
					throw error;
				}
			}

			return createdClasses;
		});

		return NextResponse.json(
			{
				message: `Successfully created ${results.length} classes`,
				classes: results,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error in bulk create classes:", error);
		return NextResponse.json(
			{ error: "Failed to bulk create classes" },
			{ status: 500 }
		);
	}
}
