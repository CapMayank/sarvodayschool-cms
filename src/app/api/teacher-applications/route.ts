/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
	try {
		await requireAuth(request);
	} catch {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const applications = await prisma.teacherApplication.findMany({
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(applications);
	} catch (error) {
		console.error("Error fetching applications:", error);
		return NextResponse.json(
			{ error: "Failed to fetch applications" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.name || !body.resumeUrl) {
			return NextResponse.json(
				{ error: "Name and resume are required" },
				{ status: 400 }
			);
		}

		const application = await prisma.teacherApplication.create({
			data: {
				name: body.name,
				gender: body.gender,
				mobileNumber: body.mobileNumber,
				address: body.address,
				district: body.district,
				block: body.block,
				qualifications: body.qualifications,
				specialization: body.specialization,
				professionalQualification: body.professionalQualification,
				otherProfessionalQualification:
					body.otherProfessionalQualification || null,
				subject: body.subject,
				class: body.class,
				experience: parseInt(body.experience),
				resumeUrl: body.resumeUrl, // ← NOW INCLUDED
				status: body.status || "New",
			},
		});

		return NextResponse.json(application, { status: 201 });
	} catch (error) {
		console.error("Error creating application:", error);
		return NextResponse.json(
			{ error: "Failed to create application" },
			{ status: 500 }
		);
	}
}
