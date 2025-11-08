/** @format */

interface EmailOptions {
	to: string | string[];
	subject: string;
	html: string;
	from?: string;
}

export class EmailService {
	private static async getResend() {
		const Resend = (await import("resend")).Resend;
		return new Resend(process.env.RESEND_API_KEY);
	}

	static async sendEmail(options: EmailOptions) {
		try {
			const resend = await this.getResend();

			await resend.emails.send({
				from:
					options.from ||
					process.env.EMAIL_FROM ||
					"noreply@notifications.sarvodayaschool.co.in",
				to: options.to,
				subject: options.subject,
				html: options.html,
			});

			return { success: true };
		} catch (error) {
			console.error("Failed to send email:", error);
			return { success: false, error };
		}
	}

	static async sendTeacherApplicationNotification(applicationData: {
		id: string;
		name: string;
		subject: string;
		class: string;
		experience: number;
		mobileNumber?: string;
		resumeUrl: string;
	}) {
		const dashboardUrl =
			process.env.NEXT_PUBLIC_APP_URL || "https://sarvodayaschool.co.in";
		const applicationUrl = `${dashboardUrl}/dashboard/teacher-recruitment`;

		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
					<h1 style="color: #2563eb; margin: 0; font-size: 24px;">🎓 New Teacher Application Received</h1>
				</div>
				
				<div style="background-color: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
					<h2 style="color: #1f2937; margin-top: 0;">Application Details</h2>
					
					<table style="width: 100%; border-collapse: collapse;">
						<tr>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
								<strong style="color: #374151;">Applicant Name:</strong>
							</td>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">
								${applicationData.name}
							</td>
						</tr>
						<tr>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
								<strong style="color: #374151;">Subject:</strong>
							</td>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">
								${applicationData.subject}
							</td>
						</tr>
						<tr>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
								<strong style="color: #374151;">Class:</strong>
							</td>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">
								${applicationData.class}
							</td>
						</tr>
						<tr>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
								<strong style="color: #374151;">Experience:</strong>
							</td>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">
								${applicationData.experience} ${
			applicationData.experience === 1 ? "year" : "years"
		}
							</td>
						</tr>
						${
							applicationData.mobileNumber
								? `
						<tr>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
								<strong style="color: #374151;">Mobile Number:</strong>
							</td>
							<td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">
								${applicationData.mobileNumber}
							</td>
						</tr>
						`
								: ""
						}
						<tr>
							<td style="padding: 8px 0;">
								<strong style="color: #374151;">Application ID:</strong>
							</td>
							<td style="padding: 8px 0; color: #6b7280; font-family: monospace;">
								#${applicationData.id}
							</td>
						</tr>
					</table>
					
					<div style="margin: 24px 0; text-align: center;">
						<a href="${applicationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
							📋 View Application Dashboard
						</a>
					</div>
					
					<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
						<p style="margin: 0 0 8px 0; color: #374151; font-weight: 600;">Resume:</p>
						<a href="${
							applicationData.resumeUrl
						}" style="color: #2563eb; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
							📄 Download Resume
						</a>
					</div>
				</div>
				
				<div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 6px; font-size: 14px; color: #6b7280;">
					<p style="margin: 0; font-weight: 600;">📧 Sarvodaya School CMS</p>
					<p style="margin: 8px 0 0 0;">This is an automated notification. Please review and respond to the application promptly.</p>
				</div>
			</div>
		`;

		// Get admin emails from environment or database
		const adminEmails = await this.getAdminEmails();

		if (adminEmails.length === 0) {
			console.warn(
				"No admin emails configured for teacher application notifications"
			);
			return { success: false, error: "No admin emails configured" };
		}

		return await this.sendEmail({
			to: adminEmails,
			subject: `New Teacher Application: ${applicationData.name} - ${applicationData.subject}`,
			html,
		});
	}

	private static async getAdminEmails(): Promise<string[]> {
		try {
			// Try to get admin emails from environment variable first
			const envAdminEmails = process.env.ADMIN_EMAIL_ADDRESSES;
			if (envAdminEmails) {
				return envAdminEmails.split(",").map((email) => email.trim());
			}

			// Fallback to getting admin emails from database
			const { prisma } = await import("@/lib/prisma");
			const adminUsers = await prisma.user.findMany({
				where: { role: "admin" },
				select: { email: true },
			});

			return adminUsers.map((user) => user.email);
		} catch (error) {
			console.error("Failed to get admin emails:", error);
			// Fallback to a default admin email
			return [process.env.DEFAULT_ADMIN_EMAIL || "sarvodaya816@gmail.com"];
		}
	}
}
