/** @format */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ResultData {
	student: {
		rollNumber: string;
		name: string;
		enrollmentNo?: string;
		fathersName?: string;
		mothersName?: string;
		class: string;
	};
	examInfo: {
		examType: string;
		academicYear: string;
		resultDate?: string;
	};
	marks: Array<{
		subject: string;
		maxMarks: number;
		marksObtained: number;
		theoryMaxMarks?: number;
		practicalMaxMarks?: number;
		theoryMarks?: number;
		practicalMarks?: number;
		isTheoryPassed?: boolean;
		isPracticalPassed?: boolean;
		isPassed: boolean;
		hasPractical: boolean;
	}>;
	resultSummary: {
		totalMarks: number;
		maxTotalMarks: number;
		percentage: number;
		overallResult: "PASS" | "FAIL";
	};
}

export async function POST(request: NextRequest) {
	try {
		const { student, result, academicYear } = await request.json();

		// Check if results are published for this academic year
		const publication = await prisma.resultPublication.findUnique({
			where: { academicYear },
		});

		if (!publication) {
			return NextResponse.json(
				{ error: "Results not available for this academic year" },
				{ status: 404 }
			);
		}

		const now = new Date();
		if (!publication.isPublished && now < publication.publishDate) {
			return NextResponse.json(
				{
					error: "Results are not yet published",
					publishDate: publication.publishDate,
				},
				{ status: 403 }
			);
		}

		// Transform the already fetched data for PDF
		const resultData: ResultData = {
			student: {
				rollNumber: student.rollNumber,
				name: student.name,
				enrollmentNo: student.enrollmentNo || undefined,
				fathersName: student.fatherName || undefined,
				mothersName: student.motherName || undefined,
				class: student.class,
			},
			examInfo: {
				examType: "Annual Examination",
				academicYear: academicYear,
				resultDate: new Date().toLocaleDateString(),
			},
			marks: result.subjectMarks.map(
				(sm: {
					subject: string;
					marksObtained: number;
					theoryMarks?: number;
					practicalMarks?: number;
					theoryMaxMarks?: number;
					practicalMaxMarks?: number;
					maxMarks: number;
					isPassed: boolean;
					isTheoryPassed?: boolean;
					isPracticalPassed?: boolean;
					hasPractical: boolean;
				}) => {
					if (sm.hasPractical) {
						// For classes 9-12 with theory+practical
						return {
							subject: sm.subject,
							marksObtained: sm.marksObtained,
							theoryMarks: sm.theoryMarks || 0,
							practicalMarks: sm.practicalMarks || 0,
							theoryMaxMarks: sm.theoryMaxMarks || 0,
							practicalMaxMarks: sm.practicalMaxMarks || 0,
							maxMarks: sm.maxMarks,
							isPassed: sm.isPassed,
							isTheoryPassed: sm.isTheoryPassed || false,
							isPracticalPassed: sm.isPracticalPassed || false,
							hasPractical: true,
						};
					} else {
						// For classes Nursery-8th (traditional marking)
						return {
							subject: sm.subject,
							marksObtained: sm.marksObtained,
							maxMarks: sm.maxMarks,
							isPassed: sm.isPassed,
							hasPractical: false,
						};
					}
				}
			),
			resultSummary: {
				totalMarks: result.totalMarks,
				maxTotalMarks: result.maxTotalMarks,
				percentage: result.percentage,
				overallResult: result.isPassed ? "PASS" : "FAIL",
			},
		};

		// Generate HTML content that can be printed as PDF by browser
		const htmlContent = generateMarkStatementHTML(resultData);

		// Return HTML with proper headers for PDF conversion
		return new NextResponse(htmlContent, {
			status: 200,
			headers: {
				"Content-Type": "text/html",
				"Content-Disposition": `inline; filename="mark-statement-${student.rollNumber}-${academicYear}.html"`,
			},
		});
	} catch (error) {
		console.error("PDF generation error:", error);
		return NextResponse.json(
			{ error: "Failed to generate PDF" },
			{ status: 500 }
		);
	}
}

function generateMarkStatementHTML(data: ResultData): string {
	const hasPracticalSubjects = data.marks.some((mark) => mark.hasPractical);

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Mark Statement</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			margin: 0;
			padding: 20px;
			line-height: 1.4;
		}
		.header {
			text-align: center;
			margin-bottom: 30px;
			border-bottom: 3px solid #1e40af;
			padding-bottom: 15px;
		}
		.school-name {
			font-size: 24px;
			font-weight: bold;
			color: #1e40af;
			margin-bottom: 5px;
		}
		.school-details {
			font-size: 12px;
			color: #666;
			margin-bottom: 10px;
		}
		.session {
			font-size: 14px;
			margin: 5px 0;
			font-weight: bold;
		}
		.exam-type {
			font-size: 16px;
			font-weight: bold;
			color: #1e40af;
		}
		.title {
			font-size: 20px;
			font-weight: bold;
			text-align: center;
			margin: 20px 0;
			color: #1e40af;
		}
		.student-info {
			border: 2px solid #666;
			padding: 15px;
			margin: 20px 0;
			background: #f8f9fa;
		}
		.info-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;
		}
		.info-item {
			font-size: 12px;
		}
		.info-label {
			font-weight: bold;
		}
		.marks-table {
			width: 100%;
			border-collapse: collapse;
			margin: 20px 0;
			font-size: 11px;
		}
		.marks-table th,
		.marks-table td {
			border: 1px solid #333;
			padding: 8px;
			text-align: center;
		}
		.marks-table th {
			background: #f3f4f6;
			font-weight: bold;
		}
		.failed-row {
			background: #fef2f2;
		}
		.pass-status {
			color: #065f46;
			font-weight: bold;
		}
		.fail-status {
			color: #dc2626;
			font-weight: bold;
		}
		.summary {
			border: 2px solid #666;
			padding: 15px;
			margin: 20px 0;
			background: #f8f9fa;
		}
		.summary-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;
		}
		.footer {
			text-align: center;
			font-size: 10px;
			color: #666;
			margin-top: 30px;
			border-top: 1px solid #ccc;
			padding-top: 15px;
		}
	</style>
</head>
<body>
	<div class="header">
		<div class="school-name">Sarvodaya English Higher Secondary School</div>
		<div class="school-details">
			Lakhnadon, District - Seoni, Madhya Pradesh<br>
			website: sarvodayaschool.co.in | Phone: +91-8989646850 | Email: sarvodaya816@gmail.com
		</div>
		<div class="session">Session: ${data.examInfo.academicYear}</div>
		<div class="exam-type">${data.examInfo.examType}</div>
	</div>

	<div class="title">MARK STATEMENT</div>

	<div class="student-info">
		<strong style="font-size: 14px; margin-bottom: 10px; display: block;">Student Details</strong>
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">Name:</span> ${data.student.name}
			</div>
			<div class="info-item">
				<span class="info-label">Class:</span> ${data.student.class}
			</div>
			<div class="info-item">
				<span class="info-label">Roll No:</span> ${data.student.rollNumber}
			</div>
			<div class="info-item">
				<span class="info-label">Enrollment No:</span> ${
					data.student.enrollmentNo || "N/A"
				}
			</div>
			<div class="info-item">
				<span class="info-label">Father's Name:</span> ${
					data.student.fathersName || "N/A"
				}
			</div>
			<div class="info-item">
				<span class="info-label">Exam:</span> ${data.examInfo.examType}
			</div>
		</div>
	</div>

	<strong style="font-size: 14px; margin: 20px 0 10px 0; display: block;">Statement of Marks</strong>
	<table class="marks-table">
		<thead>
			<tr>
				${
					hasPracticalSubjects
						? `
					<th>S.N.</th>
					<th>Subject</th>
					<th>Max Theory</th>
					<th>Max Practical</th>
					<th>Theory Marks</th>
					<th>Practical Marks</th>
					<th>Total</th>
					<th>Max Marks</th>
					<th>Status</th>
				`
						: `
					<th>S.N.</th>
					<th>Subject</th>
					<th>Max Marks</th>
					<th>Obtained</th>
					<th>Percentage</th>
					<th>Status</th>
				`
				}
			</tr>
		</thead>
		<tbody>
			${data.marks
				.map((mark, index) => {
					const rowClass = !mark.isPassed ? "failed-row" : "";
					const statusClass = mark.isPassed ? "pass-status" : "fail-status";

					if (hasPracticalSubjects && mark.hasPractical) {
						return `
						<tr class="${rowClass}">
							<td>${index + 1}</td>
							<td style="text-align: left;">${mark.subject}</td>
							<td>${mark.theoryMaxMarks || "-"}</td>
							<td>${mark.practicalMaxMarks || "-"}</td>
							<td>${mark.theoryMarks || "-"}</td>
							<td>${mark.practicalMarks || "-"}</td>
							<td>${mark.marksObtained}</td>
							<td>${mark.maxMarks}</td>
							<td class="${statusClass}">${mark.isPassed ? "PASS" : "FAIL"}</td>
						</tr>
					`;
					} else if (hasPracticalSubjects && !mark.hasPractical) {
						return `
						<tr class="${rowClass}">
							<td>${index + 1}</td>
							<td style="text-align: left;">${mark.subject}</td>
							<td>${mark.maxMarks}</td>
							<td>-</td>
							<td>${mark.marksObtained}</td>
							<td>-</td>
							<td>${mark.marksObtained}</td>
							<td>${mark.maxMarks}</td>
							<td class="${statusClass}">${mark.isPassed ? "PASS" : "FAIL"}</td>
						</tr>
					`;
					} else {
						const percentage = (
							(mark.marksObtained / mark.maxMarks) *
							100
						).toFixed(1);
						return `
						<tr class="${rowClass}">
							<td>${index + 1}</td>
							<td style="text-align: left;">${mark.subject}</td>
							<td>${mark.maxMarks}</td>
							<td>${mark.marksObtained}</td>
							<td>${percentage}%</td>
							<td class="${statusClass}">${mark.isPassed ? "PASS" : "FAIL"}</td>
						</tr>
					`;
					}
				})
				.join("")}
		</tbody>
	</table>

	<div class="summary">
		<strong style="font-size: 14px; margin-bottom: 10px; display: block;">Result</strong>
		<div class="summary-grid">
			<div>
				<strong>Total Marks Obtained:</strong> ${data.resultSummary.totalMarks}
			</div>
			<div>
				<strong>Maximum Marks:</strong> ${data.resultSummary.maxTotalMarks}
			</div>
			<div>
				<strong>Percentage:</strong> ${data.resultSummary.percentage.toFixed(2)}%
			</div>
			<div class="${
				data.resultSummary.overallResult === "PASS"
					? "pass-status"
					: "fail-status"
			}">
				<strong>Overall Result:</strong> ${data.resultSummary.overallResult}
			</div>
		</div>
	</div>

	<div class="footer">
		Generated on: ${new Date().toLocaleDateString(
			"en-IN"
		)} at ${new Date().toLocaleTimeString("en-IN")}<br>
		This is a computer-generated document and does not require a signature.
	</div>
</body>
</html>
	`;
}
