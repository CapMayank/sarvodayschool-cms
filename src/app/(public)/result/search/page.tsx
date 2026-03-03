/** @format */

"use client";

import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Loader2,
	Search,
	Download,
	CheckCircle,
	XCircle,
	AlertCircle,
} from "lucide-react";

interface SearchResult {
	student: {
		id: number;
		rollNumber: string;
		enrollmentNo: string;
		name: string;
		fatherName: string;
		dateOfBirth: string;
		class: string;
	};
	result: {
		totalMarks: number;
		maxTotalMarks: number;
		percentage: number;
		isPassed: boolean;
		subjectMarks: Array<{
			subject: string;
			marksObtained: number;
			maxMarks: number;
			passingMarks: number;
			isPassed: boolean;
			isAdditional: boolean;
			hasPractical: boolean;
			// For theory/practical subjects (classes 9-12)
			theoryMarks?: number;
			practicalMarks?: number;
			theoryMaxMarks?: number;
			practicalMaxMarks?: number;
			theoryPassingMarks?: number;
			practicalPassingMarks?: number;
			isTheoryPassed?: boolean;
			isPracticalPassed?: boolean;
		}>;
	};
}

const getCurrentAcademicYear = () => {
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth(); // 0-based (0 = January)

	// Academic year starts from April (month 3)
	if (currentMonth >= 3) {
		// April or later
		return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
	} else {
		// January to March
		return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
	}
};

export default function ResultSearchPage() {
	const [publishedResult, setPublishedResult] = useState<{
		academicYear: string;
		publishDate: string;
		isPublished: boolean;
	} | null>(null);
	const [isLoadingPublication, setIsLoadingPublication] = useState(true);
	const [searchData, setSearchData] = useState({
		rollNumber: "",
		enrollmentNo: "",
		dateOfBirth: "",
		academicYear: getCurrentAcademicYear(),
	});
	const [searching, setSearching] = useState(false);
	const [result, setResult] = useState<SearchResult | null>(null);
	const [useEnrollment, setUseEnrollment] = useState(true);

	// Fetch published result data
	useEffect(() => {
		const fetchPublishedResult = async () => {
			try {
				const response = await fetch("/api/result/publication/public");
				const data = await response.json();
				setPublishedResult(data.publication);
			} catch (error) {
				console.error("Error fetching published result:", error);
			} finally {
				setIsLoadingPublication(false);
			}
		};

		fetchPublishedResult();
	}, []);

	const handleSearch = async () => {
		if (!searchData.rollNumber || !searchData.academicYear) {
			toast.error("Please enter roll number and academic year");
			return;
		}

		if (!searchData.enrollmentNo && !searchData.dateOfBirth) {
			toast.error("Please enter either enrollment number or date of birth");
			return;
		}

		try {
			setSearching(true);
			const response = await fetch("/api/result/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(searchData),
			});

			const data = await response.json();

			if (!response.ok) {
				if (response.status === 403 && data.publishDate) {
					toast.error(
						`Results will be available on ${new Date(
							data.publishDate,
						).toLocaleString()}`,
					);
				} else {
					toast.error(data.error || "Failed to fetch result");
				}
				setResult(null);
				return;
			}

			setResult(data);
			toast.success("Result found successfully");
		} catch (error) {
			console.error("Error searching for result:", error);
			toast.error("Failed to search for result");
			setResult(null);
		} finally {
			setSearching(false);
		}
	};

	const handleDownloadPDF = async () => {
		if (!result) return;

		try {
			// Create API call to generate HTML for PDF conversion
			const response = await fetch("/api/result/download-pdf", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					student: result.student,
					result: result.result,
					academicYear: searchData.academicYear,
				}),
			});

			if (response.ok) {
				const htmlContent = await response.text();

				// Open HTML content in new window for printing
				const printWindow = window.open("", "_blank");
				if (printWindow) {
					printWindow.document.write(htmlContent);
					printWindow.document.close();

					// Wait a moment for content to load, then trigger print
					setTimeout(() => {
						printWindow.focus();
						printWindow.print();
					}, 500);
				} else {
					// Fallback: create a blob and download as HTML file
					const blob = new Blob([htmlContent], { type: "text/html" });
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.style.display = "none";
					a.href = url;
					a.download = `${result.student.name}_${result.student.rollNumber}_MarkStatement_${searchData.academicYear}.html`;
					document.body.appendChild(a);
					a.click();
					window.URL.revokeObjectURL(url);
				}

				toast.success("Mark statement opened for printing/download");
			} else {
				throw new Error("Failed to generate mark statement");
			}
		} catch (error) {
			console.error("Error downloading PDF:", error);
			toast.error("Failed to download mark statement. Please try again.");
		}
	};

	const publishedDateLabel = publishedResult?.publishDate
		? new Date(publishedResult.publishDate).toLocaleString("en-IN", {
				dateStyle: "medium",
				timeStyle: "short",
			})
		: "";

	const hasAnyPractical =
		result?.result.subjectMarks.some((mark) => mark.hasPractical) ?? false;

	return (
		<>
			<Header title="Academic Result Portal" />
			<div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 py-6 sm:py-10 px-3 sm:px-5">
				<div className="max-w-6xl mx-auto space-y-5 sm:space-y-8">
					<section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-5 sm:p-8 shadow-sm">
						<div className="text-center space-y-3">
							<p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
								Result Portal
							</p>
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
								Annual Examination Result Search
							</h1>
							<p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
								Enter student credentials below to view the official marks
								statement.
							</p>
							{publishedResult?.isPublished && publishedDateLabel && (
								<div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs sm:text-sm font-medium text-emerald-700">
									Published on {publishedDateLabel}
								</div>
							)}
						</div>
					</section>

					{/* Check if results are published */}
					{isLoadingPublication ? (
						<div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 flex justify-center items-center">
							<Loader2 className="h-8 w-8 animate-spin text-slate-700" />
							<span className="ml-3 text-slate-600 font-medium">
								Loading published results...
							</span>
						</div>
					) : !publishedResult?.isPublished ? (
						<div className="text-center bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
							<AlertCircle className="h-14 w-14 text-slate-400 mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-slate-900 mb-3">
								Results Not Available
							</h2>
							<p className="text-base sm:text-lg text-slate-600 mb-6">
								No results have been published yet. Please check back later.
							</p>
							<a
								href="/result"
								className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-slate-800 transition-colors"
							>
								Back to Results Page
							</a>
						</div>
					) : (
						<>
							<Card className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
								<CardHeader className="border-b border-slate-200 bg-slate-900 text-white p-5 sm:p-6">
									<CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-semibold">
										<Search className="h-5 w-5" />
										Find Student Result
									</CardTitle>
									<p className="text-sm text-slate-200 mt-1">
										Use roll number and one verification method.
									</p>
								</CardHeader>
								<CardContent className="p-5 sm:p-6 lg:p-7 space-y-6">
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
										<div className="space-y-2.5">
											<Label className="text-sm font-medium text-slate-700">
												Roll Number *
											</Label>
											<Input
												value={searchData.rollNumber}
												onChange={(e) =>
													setSearchData({
														...searchData,
														rollNumber: e.target.value,
													})
												}
												placeholder="Enter roll number"
												className="h-11 border-slate-300"
											/>
										</div>
										<div className="space-y-2.5">
											<Label className="text-sm font-medium text-slate-700">
												Academic Year *
											</Label>
											<Input
												value={searchData.academicYear}
												onChange={(e) =>
													setSearchData({
														...searchData,
														academicYear: e.target.value,
													})
												}
												placeholder="2025-26"
												className="h-11 border-slate-300"
											/>
										</div>
									</div>

									<div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
										<div className="space-y-2">
											<Label className="text-sm font-medium text-slate-700">
												Verification Method
											</Label>
											<div className="grid grid-cols-2 gap-2 rounded-lg bg-white p-1 border border-slate-200">
												<button
													type="button"
													onClick={() => {
														setUseEnrollment(true);
														setSearchData({ ...searchData, dateOfBirth: "" });
													}}
													className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
														useEnrollment
															? "bg-slate-900 text-white"
															: "text-slate-600 hover:bg-slate-100"
													}`}
												>
													Enrollment Number
												</button>
												<button
													type="button"
													onClick={() => {
														setUseEnrollment(false);
														setSearchData({ ...searchData, enrollmentNo: "" });
													}}
													className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
														!useEnrollment
															? "bg-slate-900 text-white"
															: "text-slate-600 hover:bg-slate-100"
													}`}
												>
													Date of Birth
												</button>
											</div>
										</div>

										<div className="space-y-2.5">
											<Label className="text-sm font-medium text-slate-700">
												{useEnrollment
													? "Enrollment Number *"
													: "Date of Birth *"}
											</Label>
											{useEnrollment ? (
												<Input
													value={searchData.enrollmentNo}
													onChange={(e) =>
														setSearchData({
															...searchData,
															enrollmentNo: e.target.value,
														})
													}
													placeholder="Enter enrollment number"
													className="h-11 border-slate-300 bg-white"
												/>
											) : (
												<Input
													type="date"
													value={searchData.dateOfBirth}
													onChange={(e) =>
														setSearchData({
															...searchData,
															dateOfBirth: e.target.value,
														})
													}
													className="h-11 border-slate-300 bg-white"
												/>
											)}
											<p className="text-xs text-slate-500">
												Provide one verification method to continue.
											</p>
										</div>
									</div>

									<Button
										onClick={handleSearch}
										disabled={searching}
										size="lg"
										className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white"
									>
										{searching ? (
											<>
												<Loader2 className="h-5 w-5 mr-2 animate-spin" />
												Searching...
											</>
										) : (
											<>
												<Search className="h-5 w-5 mr-2" />
												Search Result
											</>
										)}
									</Button>
								</CardContent>
							</Card>

							{/* Result Display */}
							{result && publishedResult?.isPublished && (
								<Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
									<CardHeader className="bg-slate-900 text-white p-5 sm:p-6">
										<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
											<div className="space-y-3">
												<CardTitle className="text-xl sm:text-2xl font-bold">
													Official Academic Result
												</CardTitle>
												<div className="flex flex-wrap gap-2 text-xs sm:text-sm">
													<span className="rounded-full bg-slate-700 px-3 py-1.5 font-medium">
														Academic Year: {searchData.academicYear}
													</span>
													<span className="rounded-full bg-slate-700 px-3 py-1.5 font-medium">
														Class: {result.student.class}
													</span>
												</div>
											</div>
											<Button
												variant="outline"
												size="lg"
												className="bg-white text-slate-900 hover:bg-slate-100 border-white font-semibold w-full sm:w-auto"
												onClick={handleDownloadPDF}
											>
												<Download className="h-5 w-5 mr-2" />
												Download Result
											</Button>
										</div>
									</CardHeader>
									<CardContent className="p-4 sm:p-6 lg:p-7 bg-white space-y-6">
										<div className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-white">
											<h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
												Student Information
											</h2>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
												<div>
													<p className="text-xs uppercase tracking-wide text-slate-500">
														Student Name
													</p>
													<p className="font-semibold text-slate-900">
														{result.student.name}
													</p>
												</div>
												<div>
													<p className="text-xs uppercase tracking-wide text-slate-500">
														Father&apos;s Name
													</p>
													<p className="font-semibold text-slate-900">
														{result.student.fatherName}
													</p>
												</div>
												<div>
													<p className="text-xs uppercase tracking-wide text-slate-500">
														Roll Number
													</p>
													<p className="font-semibold text-slate-900">
														{result.student.rollNumber}
													</p>
												</div>
												<div>
													<p className="text-xs uppercase tracking-wide text-slate-500">
														Enrollment No.
													</p>
													<p className="font-semibold text-slate-900">
														{result.student.enrollmentNo}
													</p>
												</div>
												<div>
													<p className="text-xs uppercase tracking-wide text-slate-500">
														Class
													</p>
													<p className="font-semibold text-slate-900">
														{result.student.class}
													</p>
												</div>
												<div>
													<p className="text-xs uppercase tracking-wide text-slate-500">
														Date of Birth
													</p>
													<p className="font-semibold text-slate-900">
														{new Date(
															result.student.dateOfBirth,
														).toLocaleDateString("en-GB")}
													</p>
												</div>
											</div>
										</div>

										<div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
											<div className="bg-slate-100 px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200">
												<h3 className="text-sm sm:text-base font-semibold text-slate-900">
													Detailed Marks Statement
												</h3>
											</div>

											<div className="overflow-x-auto">
												<table className="w-full min-w-max">
													<thead>
														<tr className="bg-slate-50 border-b border-slate-200">
															<th className="px-2 sm:px-3 lg:px-4 py-3 text-center font-semibold text-slate-700 text-xs sm:text-sm border-r border-slate-200">
																S.N.
															</th>
															<th className="px-3 sm:px-4 lg:px-6 py-3 text-center font-semibold text-slate-700 text-xs sm:text-sm min-w-30 border-r border-slate-200">
																Subject
															</th>
															<th className="px-2 sm:px-3 lg:px-4 py-3 text-center font-semibold text-slate-700 text-xs sm:text-sm min-w-25 border-r border-slate-200">
																<div>Max Marks</div>
																{hasAnyPractical && (
																	<div className="grid grid-cols-2 gap-1 mt-1 sm:mt-2">
																		<div className="text-[10px] sm:text-xs bg-slate-200 text-slate-700 p-1 rounded">
																			Theory
																		</div>
																		<div className="text-[10px] sm:text-xs bg-slate-200 text-slate-700 p-1 rounded">
																			Practical
																		</div>
																	</div>
																)}
															</th>
															<th className="px-2 sm:px-3 lg:px-4 py-3 text-center font-semibold text-slate-700 text-xs sm:text-sm min-w-30 border-r border-slate-200">
																<div>Obtained Marks</div>
																{hasAnyPractical && (
																	<div className="grid grid-cols-2 gap-1 mt-1 sm:mt-2">
																		<div className="text-[10px] sm:text-xs bg-slate-200 text-slate-700 p-1 rounded">
																			Theory
																		</div>
																		<div className="text-[10px] sm:text-xs bg-slate-200 text-slate-700 p-1 rounded">
																			Practical
																		</div>
																	</div>
																)}
															</th>
															<th className="px-2 sm:px-3 lg:px-4 py-3 text-center font-semibold text-slate-700 text-xs sm:text-sm min-w-20 border-r border-slate-200">
																Total
															</th>
															<th className="px-2 sm:px-3 lg:px-4 py-3 text-center font-semibold text-slate-700 text-xs sm:text-sm min-w-20">
																Status
															</th>
														</tr>
													</thead>
													<tbody>
														{result.result.subjectMarks
															.filter((mark) => !mark.isAdditional)
															.map((mark, index) => (
																<tr
																	key={index}
																	className={`border-b border-slate-200 ${
																		!mark.isPassed ? "bg-red-50/70" : "bg-white"
																	}`}
																>
																	<td className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-slate-600 text-xs sm:text-sm border-r border-slate-200">
																		{index + 1}
																	</td>
																	<td className="px-2 sm:px-3 lg:px-6 py-3 border-r border-slate-200">
																		<div className="font-medium text-slate-800 text-xs sm:text-sm lg:text-base">
																			{mark.subject}
																		</div>
																	</td>
																	<td className="px-1 sm:px-2 lg:px-4 py-3 border-r border-slate-200">
																		{mark.hasPractical ? (
																			<div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
																				<div className="bg-slate-100 p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold text-slate-700">
																					{mark.theoryMaxMarks}
																				</div>
																				<div className="bg-slate-100 p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold text-slate-700">
																					{mark.practicalMaxMarks}
																				</div>
																			</div>
																		) : (
																			<div className="text-center font-semibold text-slate-800 text-sm sm:text-base lg:text-lg">
																				{mark.maxMarks}
																			</div>
																		)}
																	</td>
																	<td className="px-1 sm:px-2 lg:px-4 py-3 border-r border-slate-200">
																		{mark.hasPractical ? (
																			<div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
																				<div
																					className={`p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold ${
																						mark.isTheoryPassed
																							? "bg-emerald-100 text-emerald-800"
																							: "bg-red-100 text-red-800"
																					}`}
																				>
																					{mark.theoryMarks}
																				</div>
																				<div
																					className={`p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold ${
																						mark.isPracticalPassed
																							? "bg-emerald-100 text-emerald-800"
																							: "bg-red-100 text-red-800"
																					}`}
																				>
																					{mark.practicalMarks}
																				</div>
																			</div>
																		) : (
																			<div className="text-center font-semibold text-slate-800 text-sm sm:text-base lg:text-lg">
																				{mark.marksObtained}
																			</div>
																		)}
																	</td>
																	<td className="px-1 sm:px-2 lg:px-4 py-3 text-center border-r border-slate-200">
																		<div className="font-bold text-sm sm:text-lg text-slate-800">
																			{mark.marksObtained}
																		</div>
																		<div className="text-xs text-slate-500 mt-1">
																			/ {mark.maxMarks}
																		</div>
																	</td>
																	<td className="px-1 sm:px-2 lg:px-4 py-3 text-center">
																		{mark.isPassed ? (
																			<div className="inline-flex items-center gap-1 sm:gap-2 bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
																				<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
																				PASS
																			</div>
																		) : (
																			<div className="inline-flex items-center gap-1 sm:gap-2 bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
																				<XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
																				FAIL
																			</div>
																		)}
																	</td>
																</tr>
															))}
													</tbody>

													{/* Additional Subjects Section */}
													{result.result.subjectMarks.some(
														(mark) => mark.isAdditional,
													) && (
														<>
															<tbody>
																<tr className="bg-amber-50 border-y border-slate-200">
																	<td
																		colSpan={6}
																		className="px-3 sm:px-4 lg:px-6 py-3 text-center font-semibold text-slate-800 text-sm sm:text-base"
																	>
																		Additional Subjects
																	</td>
																</tr>
																{result.result.subjectMarks
																	.filter((mark) => mark.isAdditional)
																	.map((mark, index) => (
																		<tr
																			key={`additional-${index}`}
																			className={`border-b border-slate-200 ${
																				!mark.isPassed
																					? "bg-red-50/70"
																					: "bg-amber-50/40"
																			}`}
																		>
																			<td className="px-2 sm:px-3 lg:px-4 py-3 text-center font-medium text-slate-600 text-xs sm:text-sm border-r border-slate-200">
																				{index + 1}
																			</td>
																			<td className="px-2 sm:px-3 lg:px-6 py-3 border-r border-slate-200">
																				<div className="font-medium text-slate-800 text-xs sm:text-sm lg:text-base">
																					{mark.subject}
																				</div>
																				<span className="inline-block mt-1 px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded-full font-medium">
																					Additional
																				</span>
																			</td>
																			<td className="px-1 sm:px-2 lg:px-4 py-3 border-r border-slate-200">
																				{mark.hasPractical ? (
																					<div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
																						<div className="bg-slate-100 p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold text-slate-700">
																							{mark.theoryMaxMarks}
																						</div>
																						<div className="bg-slate-100 p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold text-slate-700">
																							{mark.practicalMaxMarks}
																						</div>
																					</div>
																				) : (
																					<div className="text-center font-semibold text-slate-800 text-sm sm:text-base lg:text-lg">
																						{mark.maxMarks}
																					</div>
																				)}
																			</td>
																			<td className="px-1 sm:px-2 lg:px-4 py-3 border-r border-slate-200">
																				{mark.hasPractical ? (
																					<div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
																						<div
																							className={`p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold ${
																								mark.isTheoryPassed
																									? "bg-emerald-100 text-emerald-800"
																									: "bg-red-100 text-red-800"
																							}`}
																						>
																							{mark.theoryMarks}
																						</div>
																						<div
																							className={`p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold ${
																								mark.isPracticalPassed
																									? "bg-emerald-100 text-emerald-800"
																									: "bg-red-100 text-red-800"
																							}`}
																						>
																							{mark.practicalMarks}
																						</div>
																					</div>
																				) : (
																					<div className="text-center font-semibold text-slate-800 text-sm sm:text-base lg:text-lg">
																						{mark.marksObtained}
																					</div>
																				)}
																			</td>
																			<td className="px-1 sm:px-2 lg:px-4 py-3 text-center border-r border-slate-200">
																				<div className="font-bold text-sm sm:text-lg text-slate-800">
																					{mark.marksObtained}
																				</div>
																				<div className="text-xs text-slate-500 mt-1">
																					/ {mark.maxMarks}
																				</div>
																			</td>
																			<td className="px-1 sm:px-2 lg:px-4 py-3 text-center">
																				{mark.isPassed ? (
																					<div className="inline-flex items-center gap-1 sm:gap-2 bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
																						<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
																						PASS
																					</div>
																				) : (
																					<div className="inline-flex items-center gap-1 sm:gap-2 bg-red-100 text-red-800 px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
																						<XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
																						FAIL
																					</div>
																				)}
																			</td>
																		</tr>
																	))}
															</tbody>
														</>
													)}
												</table>
											</div>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
											<div className="rounded-xl border border-slate-200 p-4 text-center bg-slate-50">
												<p className="text-xs sm:text-sm text-slate-600 font-medium mb-1">
													Total Marks Obtained
												</p>
												<p className="text-2xl font-bold text-slate-900">
													{result.result.totalMarks}
												</p>
												<p className="text-xs text-slate-500">
													out of {result.result.maxTotalMarks}
												</p>
											</div>
											<div className="rounded-xl border border-slate-200 p-4 text-center bg-slate-50">
												<p className="text-xs sm:text-sm text-slate-600 font-medium mb-1">
													Percentage
												</p>
												<p className="text-2xl font-bold text-slate-900">
													{result.result.percentage.toFixed(2)}%
												</p>
											</div>
											<div className="rounded-xl border border-slate-200 p-4 text-center bg-slate-50 sm:col-span-2 lg:col-span-1">
												<p className="text-xs sm:text-sm text-slate-600 font-medium mb-1">
													Final Result
												</p>
												<p
													className={`text-2xl font-bold ${
														result.result.isPassed
															? "text-emerald-700"
															: "text-red-700"
													}`}
												>
													{result.result.isPassed ? "PASS" : "FAIL"}
												</p>
											</div>
										</div>

										{/* Official Footer */}
										<div className="text-center text-xs sm:text-sm text-slate-600 border-t border-slate-200 pt-5">
											<p className="font-semibold text-slate-700">
												This is an official computer-generated result.
											</p>
											<p>
												For any queries, please contact the school
												administration.
											</p>
										</div>
									</CardContent>
								</Card>
							)}
						</>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
}
