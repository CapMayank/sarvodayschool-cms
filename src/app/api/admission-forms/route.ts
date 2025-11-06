/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const session = request.cookies.get("better-auth.session_token");
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const forms = await prisma.admissionForm.findMany({
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(forms);
	} catch (error) {
		console.error("Error fetching admission forms:", error);
		return NextResponse.json(
			{ error: "Failed to fetch admission forms" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const form = await prisma.admissionForm.create({
			data: {
				studentName: body.studentName,
				gender: body.gender,
				dateOfBirth: new Date(body.dateOfBirth),
				fatherName: body.fatherName,
				motherName: body.motherName,
				mobileNumber: body.mobileNumber,
				alternateMobile: body.alternateMobile || "",
				class: body.class,
				district: body.district,
				block: body.block,
				address: body.address,
				previousSchool: body.previousSchool || "",
				status: "New",
			},
		});

		return NextResponse.json(form, { status: 201 });
	} catch (error) {
		console.error("Error creating admission form:", error);
		return NextResponse.json(
			{ error: "Failed to submit admission form" },
			{ status: 500 }
		);
	}
}
