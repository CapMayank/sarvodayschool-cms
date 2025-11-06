/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all students with filters
export async function GET(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const classId = searchParams.get("classId");
		const academicYear = searchParams.get("academicYear");

		const where: { classId?: number; academicYear?: string } = {};
		if (classId) where.classId = parseInt(classId);
		if (academicYear) where.academicYear = academicYear;

		const students = await prisma.student.findMany({
			where,
			include: {
				class: true,
			},
			orderBy: { rollNumber: "asc" },
		});

		return NextResponse.json({ students });
	} catch (error) {
		console.error("Error fetching students:", error);
		return NextResponse.json(
			{ error: "Failed to fetch students" },
			{ status: 500 }
		);
	}
}

// POST - Create new student
export async function POST(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const {
			rollNumber,
			enrollmentNo,
			name,
			fatherName,
			dateOfBirth,
			classId,
			academicYear,
		} = body;

		if (
			!rollNumber ||
			!enrollmentNo ||
			!name ||
			!fatherName ||
			!dateOfBirth ||
			!classId ||
			!academicYear
		) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		const student = await prisma.student.create({
			data: {
				rollNumber,
				enrollmentNo,
				name,
				fatherName,
				dateOfBirth: new Date(dateOfBirth),
				classId: parseInt(classId),
				academicYear,
			},
			include: {
				class: true,
			},
		});

		return NextResponse.json({ student }, { status: 201 });
	} catch (error) {
		if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
			return NextResponse.json(
				{
					error:
						"Student with this roll number or enrollment number already exists for this academic year",
				},
				{ status: 400 }
			);
		}
		console.error("Error creating student:", error);
		return NextResponse.json(
			{ error: "Failed to create student" },
			{ status: 500 }
		);
	}
}
