/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE - Bulk delete results
export async function DELETE(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const deleteType = searchParams.get("type"); // "all" or "class"
		const classId = searchParams.get("classId");
		const academicYear = searchParams.get("academicYear");

		if (!deleteType) {
			return NextResponse.json(
				{ error: "Delete type is required (all or class)" },
				{ status: 400 }
			);
		}

		if (deleteType === "class" && !classId) {
			return NextResponse.json(
				{ error: "Class ID is required for class-wise deletion" },
				{ status: 400 }
			);
		}

		let deletedCount = 0;

		if (deleteType === "all") {
			// Delete all results and students, optionally filtered by academic year
			const whereClause = academicYear ? { academicYear } : {};

			// Find all results to be deleted
			const results = await prisma.result.findMany({
				where: whereClause,
				select: { id: true, studentId: true },
			});

			// Get unique student IDs from results
			const studentIds = [...new Set(results.map((r) => r.studentId))];

			// Delete in order due to foreign key constraints:
			// 1. Delete subject marks first
			await prisma.subjectMark.deleteMany({
				where: {
					resultId: {
						in: results.map((r) => r.id),
					},
				},
			});

			// 2. Delete results
			await prisma.result.deleteMany({
				where: whereClause,
			});

			// 3. Delete students (only those that have results in this academic year)
			let studentDeleteCount = 0;
			if (academicYear) {
				// For specific academic year, only delete students who have no other results
				for (const studentId of studentIds) {
					const remainingResults = await prisma.result.count({
						where: {
							studentId,
							academicYear: { not: academicYear },
						},
					});

					// Only delete student if they have no results in other academic years
					if (remainingResults === 0) {
						await prisma.student.delete({
							where: { id: studentId },
						});
						studentDeleteCount++;
					}
				}
			} else {
				// For all academic years, delete all students
				studentDeleteCount = await prisma.student
					.deleteMany({
						where: {
							id: { in: studentIds },
						},
					})
					.then((result) => result.count);
			}

			deletedCount = results.length;

			return NextResponse.json({
				success: true,
				deletedCount,
				studentDeleteCount,
				message: `Successfully deleted ${deletedCount} result(s) and ${studentDeleteCount} student(s)`,
			});
		} else if (deleteType === "class") {
			// Delete results and students for specific class
			const whereClause = {
				student: {
					classId: parseInt(classId!),
				},
				...(academicYear && { academicYear }),
			};

			// Find all results to be deleted
			const results = await prisma.result.findMany({
				where: whereClause,
				select: { id: true, studentId: true },
			});

			// Get unique student IDs from results
			const studentIds = [...new Set(results.map((r) => r.studentId))];

			// Delete in order due to foreign key constraints:
			// 1. Delete subject marks first
			await prisma.subjectMark.deleteMany({
				where: {
					resultId: {
						in: results.map((r) => r.id),
					},
				},
			});

			// 2. Delete results
			await prisma.result.deleteMany({
				where: whereClause,
			});

			// 3. Delete students for this class and academic year
			let studentDeleteCount = 0;
			if (academicYear) {
				// For specific academic year, only delete students who have no other results
				for (const studentId of studentIds) {
					const remainingResults = await prisma.result.count({
						where: {
							studentId,
							academicYear: { not: academicYear },
						},
					});

					// Only delete student if they have no results in other academic years
					if (remainingResults === 0) {
						await prisma.student.delete({
							where: { id: studentId },
						});
						studentDeleteCount++;
					}
				}
			} else {
				// For all academic years of this class, delete students
				studentDeleteCount = await prisma.student
					.deleteMany({
						where: {
							classId: parseInt(classId!),
							id: { in: studentIds },
						},
					})
					.then((result) => result.count);
			}

			deletedCount = results.length;

			return NextResponse.json({
				success: true,
				deletedCount,
				studentDeleteCount,
				message: `Successfully deleted ${deletedCount} result(s) and ${studentDeleteCount} student(s)`,
			});
		}

		return NextResponse.json({
			success: true,
			deletedCount,
			message: `Successfully deleted ${deletedCount} result(s)`,
		});
	} catch (error) {
		console.error("Error deleting results:", error);
		return NextResponse.json(
			{ error: "Failed to delete results" },
			{ status: 500 }
		);
	}
}

// GET - Get stats for deletion preview
export async function GET(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const type = searchParams.get("type");
		const classId = searchParams.get("classId");
		const academicYear = searchParams.get("academicYear");

		let count = 0;
		let studentCount = 0;
		let details = {};

		if (type === "all") {
			const whereClause = academicYear ? { academicYear } : {};
			count = await prisma.result.count({ where: whereClause });

			// Get student count
			if (academicYear) {
				// Count unique students with results in this academic year
				const results = await prisma.result.findMany({
					where: whereClause,
					select: { studentId: true },
					distinct: ["studentId"],
				});
				studentCount = results.length;
				details = { academicYear };
			} else {
				// Count all students with any results
				const results = await prisma.result.findMany({
					select: { studentId: true },
					distinct: ["studentId"],
				});
				studentCount = results.length;
				details = {
					message: "All results and students across all academic years",
				};
			}
		} else if (type === "class" && classId) {
			const whereClause = {
				student: {
					classId: parseInt(classId),
				},
				...(academicYear && { academicYear }),
			};

			count = await prisma.result.count({ where: whereClause });

			// Count unique students in this class with results
			const results = await prisma.result.findMany({
				where: whereClause,
				select: { studentId: true },
				distinct: ["studentId"],
			});
			studentCount = results.length;

			// Get class info
			const classInfo = await prisma.class.findUnique({
				where: { id: parseInt(classId) },
			});

			details = {
				className: classInfo?.displayName || "Unknown Class",
				academicYear: academicYear || "All years",
			};
		}

		return NextResponse.json({
			count,
			studentCount,
			details,
		});
	} catch (error) {
		console.error("Error getting deletion stats:", error);
		return NextResponse.json(
			{ error: "Failed to get deletion stats" },
			{ status: 500 }
		);
	}
}
