/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// POST - Bulk create subjects for a class
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { subjects } = body;
		const resolvedParams = await params;
		const classId = parseInt(resolvedParams.id);

		if (!subjects || !Array.isArray(subjects)) {
			return NextResponse.json(
				{ error: "Subjects array is required" },
				{ status: 400 }
			);
		}

		if (isNaN(classId)) {
			return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
		}

		// Validate each subject
		for (const subject of subjects) {
			if (!subject.name) {
				return NextResponse.json(
					{ error: "Name is required for all subjects" },
					{ status: 400 }
				);
			}
		}

		// Verify class exists
		const classExists = await prisma.class.findUnique({
			where: { id: classId },
		});

		if (!classExists) {
			return NextResponse.json({ error: "Class not found" }, { status: 404 });
		}

		// Create subjects in a transaction
		const results = await prisma.$transaction(async (tx) => {
			const createdSubjects = [];

			for (const subject of subjects) {
				try {
					const subjectData = await tx.subject.create({
						data: {
							name: subject.name,
							code: subject.code || null,
							classId: classId,
							maxMarks: subject.maxMarks || 100,
							passingMarks: subject.passingMarks || 33,
							theoryMaxMarks: subject.theoryMaxMarks || null,
							practicalMaxMarks: subject.practicalMaxMarks || null,
							theoryPassingMarks: subject.theoryPassingMarks || null,
							practicalPassingMarks: subject.practicalPassingMarks || null,
							hasPractical: subject.hasPractical || false,
							isAdditional: subject.isAdditional || false,
							order: subject.order || 0,
						},
					});
					createdSubjects.push(subjectData);
				} catch (error) {
					// Skip if already exists (unique constraint)
					if (
						error &&
						typeof error === "object" &&
						"code" in error &&
						error.code === "P2002"
					) {
						console.log(
							`Subject ${subject.name} already exists in class, skipping`
						);
						continue;
					}
					throw error;
				}
			}

			return createdSubjects;
		});

		return NextResponse.json(
			{
				message: `Successfully created ${results.length} subjects`,
				subjects: results,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error in bulk create subjects:", error);
		return NextResponse.json(
			{ error: "Failed to bulk create subjects" },
			{ status: 500 }
		);
	}
}
