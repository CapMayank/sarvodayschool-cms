/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { academicYear } = await request.json();

		if (!academicYear) {
			return NextResponse.json(
				{ error: "Academic year is required" },
				{ status: 400 }
			);
		}

		// Start a transaction to ensure data consistency
		const result = await prisma.$transaction(async (tx) => {
			// First, get the count of students and results to be deleted
			const studentCount = await tx.student.count({
				where: { academicYear },
			});

			const resultCount = await tx.result.count({
				where: {
					student: {
						academicYear,
					},
				},
			});

			// Delete all subject marks for students of this academic year
			await tx.subjectMark.deleteMany({
				where: {
					result: {
						student: {
							academicYear,
						},
					},
				},
			});

			// Delete all results for students of this academic year
			await tx.result.deleteMany({
				where: {
					student: {
						academicYear,
					},
				},
			});

			// Delete all students for this academic year
			await tx.student.deleteMany({
				where: { academicYear },
			});

			// Delete the publication record itself
			await tx.resultPublication.deleteMany({
				where: { academicYear },
			});

			return {
				studentsDeleted: studentCount,
				resultsDeleted: resultCount,
			};
		});

		console.log(`Deleted data for academic year ${academicYear}:`, result);

		return NextResponse.json({
			message: "Data deleted successfully",
			studentsDeleted: result.studentsDeleted,
			resultsDeleted: result.resultsDeleted,
		});
	} catch (error) {
		console.error("Error deleting older publication data:", error);
		return NextResponse.json(
			{ error: "Failed to delete data" },
			{ status: 500 }
		);
	}
}
