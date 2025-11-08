/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { EmailService } from "@/lib/email-service";

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
				resumeUrl: body.resumeUrl,
				status: body.status || "New",
			},
		});

		// Send email notification to admins
		try {
			console.log("Sending email notification for new teacher application:", {
				applicationId: application.id,
				applicantName: application.name,
			});

			const emailResult = await EmailService.sendTeacherApplicationNotification(
				{
					id: application.id.toString(),
					name: application.name,
					subject: application.subject,
					class: application.class,
					experience: application.experience,
					mobileNumber: application.mobileNumber || undefined,
					resumeUrl: application.resumeUrl || "",
				}
			);

			if (emailResult.success) {
				console.log("Email notification sent successfully");
			} else {
				console.error("Email notification failed:", emailResult.error);
			}
		} catch (emailError) {
			console.error("Failed to send email notification:", emailError);
			// Continue with the response even if email fails
		}

		return NextResponse.json(application, { status: 201 });
	} catch (error) {
		console.error("Error creating application:", error);
		return NextResponse.json(
			{ error: "Failed to create application" },
			{ status: 500 }
		);
	}
}
