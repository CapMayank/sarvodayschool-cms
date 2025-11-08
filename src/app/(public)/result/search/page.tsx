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
							data.publishDate
						).toLocaleString()}`
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

	return (
		<>
			<Header title="Academic Result Portal" />
			<div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
				<div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
					{/* Header Section */}
					<div className="text-center bg-white p-4 sm:p-8 rounded-lg shadow-md border">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
							ANNUAL EXAMINATION RESULTS
						</h1>
						<p className="text-sm sm:text-lg text-gray-700 max-w-2xl mx-auto">
							Search and view annual examination results
						</p>
					</div>

					{/* Check if results are published */}
					{isLoadingPublication ? (
						<div className="flex justify-center items-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
							<span className="ml-3 text-gray-600">Loading...</span>
						</div>
					) : !publishedResult?.isPublished ? (
						<div className="text-center bg-white p-8 rounded-lg shadow-md border">
							<AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-gray-900 mb-4">
								Results Not Available
							</h2>
							<p className="text-lg text-gray-600 mb-6">
								No results have been published yet. Please check back later.
							</p>
							<a
								href="/result"
								className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
							>
								Back to Results Page
							</a>
						</div>
					) : (
						<>
							{/* Search Form */}
							<Card className="shadow-lg border">
								<CardHeader className="bg-blue-900 text-white">
									<CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-semibold">
										<Search className="h-5 w-5 sm:h-6 sm:w-6" />
										Student Result Search
									</CardTitle>
								</CardHeader>
								<CardContent className="p-4 sm:p-6 bg-white">
									<div className="grid grid-cols-1 gap-4 sm:gap-6">
										<div className="space-y-4">
											<div>
												<Label className="text-sm font-medium text-gray-700 mb-2 block">
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
													placeholder="Enter your roll number"
													className="h-11 border-gray-300 focus:border-blue-500"
												/>
											</div>
											<div>
												<Label className="text-sm font-medium text-gray-700 mb-2 block">
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
													className="h-11 border-gray-300 focus:border-blue-500"
												/>
											</div>
										</div>

										<div className="space-y-4">
											{/* Authentication Method Toggle */}
											<div className="bg-gray-50 p-4 rounded-md border">
												<Label className="text-sm font-medium text-gray-700 mb-3 block">
													Verification Method
												</Label>
												<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
													<button
														type="button"
														onClick={() => {
															setUseEnrollment(true);
															setSearchData({ ...searchData, dateOfBirth: "" });
														}}
														className={`px-4 py-2 rounded-md font-medium border transition-all text-center ${
															useEnrollment
																? "bg-blue-600 text-white border-blue-600"
																: "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
														}`}
													>
														Enrollment Number
													</button>
													<button
														type="button"
														onClick={() => {
															setUseEnrollment(false);
															setSearchData({
																...searchData,
																enrollmentNo: "",
															});
														}}
														className={`px-4 py-2 rounded-md font-medium border transition-all text-center ${
															!useEnrollment
																? "bg-blue-600 text-white border-blue-600"
																: "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
														}`}
													>
														Date of Birth
													</button>
												</div>
											</div>

											{useEnrollment ? (
												<div>
													<Label className="text-sm font-medium text-gray-700 mb-2 block">
														Enrollment Number *
													</Label>
													<Input
														value={searchData.enrollmentNo}
														onChange={(e) =>
															setSearchData({
																...searchData,
																enrollmentNo: e.target.value,
															})
														}
														placeholder="Enter your enrollment number"
														className="h-11 border-gray-300 focus:border-blue-500"
													/>
												</div>
											) : (
												<div>
													<Label className="text-sm font-medium text-gray-700 mb-2 block">
														Date of Birth *
													</Label>
													<Input
														type="date"
														value={searchData.dateOfBirth}
														onChange={(e) =>
															setSearchData({
																...searchData,
																dateOfBirth: e.target.value,
															})
														}
														className="h-11 border-gray-300 focus:border-blue-500"
													/>
												</div>
											)}
										</div>
									</div>

									<div className="mt-6 flex justify-center">
										<Button
											onClick={handleSearch}
											disabled={searching}
											size="lg"
											className="px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
										>
											{searching ? (
												<>
													<Loader2 className="h-5 w-5 mr-2 animate-spin" />
													Searching Results...
												</>
											) : (
												<>
													<Search className="h-5 w-5 mr-2" />
													Search Result
												</>
											)}
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Result Display */}
							{result && publishedResult?.isPublished && (
								<Card className="shadow-2xl border-0 overflow-hidden">
									<CardHeader className="bg-slate-900 text-white">
										<div className="flex flex-col gap-4">
											<div className="text-center sm:text-left">
												<CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3">
													Official Academic Result
												</CardTitle>
												<div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
													<span className="bg-slate-700 px-3 py-2 rounded-lg font-medium text-center">
														Academic Year: {searchData.academicYear}
													</span>
													<span className="bg-slate-700 px-3 py-2 rounded-lg font-medium text-center">
														Class: {result.student.class}
													</span>
												</div>
											</div>
											<div className="flex justify-center sm:justify-end">
												<Button
													variant="outline"
													size="lg"
													className="bg-white text-slate-900 hover:bg-gray-100 border-white font-semibold shadow-md w-full sm:w-auto"
													onClick={handleDownloadPDF}
												>
													<Download className="h-5 w-5 mr-2" />
													Download Result
												</Button>
											</div>
										</div>
									</CardHeader>
									<CardContent className="p-4 sm:p-6 lg:p-8 bg-white">
										{/* Student Information Section */}
										<div className="bg-white border-2 border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-sm">
											<h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 border-b-2 border-gray-200">
												Student Information
											</h2>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
												<div className="space-y-1">
													<p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
														Student Name
													</p>
													<p className="font-bold text-lg text-gray-900">
														{result.student.name}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
														Father&apos;s Name
													</p>
													<p className="font-semibold text-lg text-gray-900">
														{result.student.fatherName}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
														Roll Number
													</p>
													<p className="font-semibold text-lg text-gray-900">
														{result.student.rollNumber}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
														Enrollment No.
													</p>
													<p className="font-semibold text-lg text-gray-900">
														{result.student.enrollmentNo}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
														Class
													</p>
													<p className="font-semibold text-lg text-gray-900">
														{result.student.class}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
														Date of Birth
													</p>
													<p className="font-semibold text-lg text-gray-900">
														{new Date(
															result.student.dateOfBirth
														).toLocaleDateString("en-GB")}
													</p>
												</div>
											</div>
										</div>

										{/* Official Marks Table */}
										<div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300">
											<div className="bg-slate-900 text-white p-3 sm:p-4 lg:p-6">
												<h3 className="text-base sm:text-lg lg:text-xl font-bold text-center uppercase tracking-wide">
													Detailed Marks Statement
												</h3>
											</div>

											<div className="overflow-x-auto">
												<table className="w-full min-w-max">
													<thead>
														<tr className="bg-gray-100 border-b-2 border-gray-300">
															<th className="border border-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-center font-bold text-gray-800 text-xs sm:text-sm">
																S.N.
															</th>
															<th className="border border-gray-300 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-bold text-gray-800 text-xs sm:text-sm min-w-[120px]">
																Subject
															</th>
															<th className="border border-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-center font-bold text-gray-800 text-xs sm:text-sm min-w-[100px]">
																<div>Max Marks</div>
																{(result.student.class === "9th" ||
																	result.student.class === "10th" ||
																	result.student.class === "11th Maths" ||
																	result.student.class === "12th Maths" ||
																	result.student.class === "11th Bio" ||
																	result.student.class === "12th Bio" ||
																	result.student.class === "11th" ||
																	result.student.class === "12th") && (
																	<div className="grid grid-cols-2 gap-1 mt-1 sm:mt-2">
																		<div className="text-xs bg-blue-100 text-blue-800 p-1 rounded">
																			Theory
																		</div>
																		<div className="text-xs bg-green-100 text-green-800 p-1 rounded">
																			Practical
																		</div>
																	</div>
																)}
															</th>
															<th className="border border-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-center font-bold text-gray-800 text-xs sm:text-sm min-w-[120px]">
																<div>Obtained Marks</div>
																{(result.student.class === "9th" ||
																	result.student.class === "10th" ||
																	result.student.class === "11th" ||
																	result.student.class === "12th") && (
																	<div className="grid grid-cols-2 gap-1 mt-1 sm:mt-2">
																		<div className="text-xs bg-blue-100 text-blue-800 p-1 rounded">
																			Theory
																		</div>
																		<div className="text-xs bg-green-100 text-green-800 p-1 rounded">
																			Practical
																		</div>
																	</div>
																)}
															</th>
															<th className="border border-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-center font-bold text-gray-800 text-xs sm:text-sm min-w-20">
																Total
															</th>
															<th className="border border-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-center font-bold text-gray-800 text-xs sm:text-sm min-w-20">
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
																	className={`${
																		!mark.isPassed ? "bg-red-50" : "bg-white"
																	} hover:bg-gray-50 transition-colors`}
																>
																	<td className="border border-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
																		{index + 1}
																	</td>
																	<td className="border border-gray-300 px-2 sm:px-3 lg:px-6 py-2 sm:py-3">
																		<div className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">
																			{mark.subject}
																		</div>
																	</td>
																	<td className="border border-gray-300 px-1 sm:px-2 lg:px-4 py-2 sm:py-3">
																		{mark.hasPractical ? (
																			<div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
																				<div className="bg-blue-50 p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold text-blue-800">
																					{mark.theoryMaxMarks}
																				</div>
																				<div className="bg-green-50 p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold text-green-800">
																					{mark.practicalMaxMarks}
																				</div>
																			</div>
																		) : (
																			<div className="text-center font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">
																				{mark.maxMarks}
																			</div>
																		)}
																	</td>
																	<td className="border border-gray-300 px-1 sm:px-2 lg:px-4 py-2 sm:py-3">
																		{mark.hasPractical ? (
																			<div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
																				<div
																					className={`p-1 sm:p-2 rounded text-xs sm:text-sm font-bold ${
																						mark.isTheoryPassed
																							? "bg-blue-100 text-blue-800"
																							: "bg-red-100 text-red-800"
																					}`}
																				>
																					{mark.theoryMarks}
																					<div className="text-xs mt-1 hidden sm:block">
																						{mark.isTheoryPassed
																							? "✓ Pass"
																							: "✗ Fail"}
																					</div>
																				</div>
																				<div
																					className={`p-1 sm:p-2 rounded text-xs sm:text-sm font-bold ${
																						mark.isPracticalPassed
																							? "bg-green-100 text-green-800"
																							: "bg-red-100 text-red-800"
																					}`}
																				>
																					{mark.practicalMarks}
																					<div className="text-xs mt-1 hidden sm:block">
																						{mark.isPracticalPassed
																							? "✓ Pass"
																							: "✗ Fail"}
																					</div>
																				</div>
																			</div>
																		) : (
																			<div className="text-center font-bold text-gray-800 text-sm sm:text-base lg:text-lg">
																				{mark.marksObtained}
																			</div>
																		)}
																	</td>
																	<td className="border border-gray-300 px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-center">
																		<div className="font-bold text-sm sm:text-lg lg:text-xl text-gray-800">
																			{mark.marksObtained}
																		</div>
																		<div className="text-xs text-gray-600 mt-1">
																			/ {mark.maxMarks}
																		</div>
																	</td>
																	<td className="border border-gray-300 px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-center">
																		{mark.isPassed ? (
																			<div className="inline-flex items-center gap-1 sm:gap-2 bg-green-100 text-green-800 px-2 sm:px-3 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm">
																				<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
																				PASS
																			</div>
																		) : (
																			<div className="inline-flex items-center gap-1 sm:gap-2 bg-red-100 text-red-800 px-2 sm:px-3 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm">
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
														(mark) => mark.isAdditional
													) && (
														<>
															<tbody>
																<tr className="bg-slate-100">
																	<td
																		colSpan={6}
																		className="border border-gray-300 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-bold text-gray-800 text-sm sm:text-base bg-slate-200"
																	>
																		Additional Subjects
																	</td>
																</tr>
																{result.result.subjectMarks
																	.filter((mark) => mark.isAdditional)
																	.map((mark, index) => (
																		<tr
																			key={`additional-${index}`}
																			className={`${
																				!mark.isPassed
																					? "bg-red-50"
																					: "bg-orange-50"
																			} hover:bg-gray-50 transition-colors`}
																		>
																			<td className="border border-gray-300 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
																				{index + 1}
																			</td>
																			<td className="border border-gray-300 px-2 sm:px-3 lg:px-6 py-2 sm:py-3">
																				<div className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">
																					{mark.subject}
																				</div>
																				<span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded-full font-medium">
																					Additional
																				</span>
																			</td>
																			<td className="border border-gray-300 px-1 sm:px-2 lg:px-4 py-2 sm:py-3">
																				{mark.hasPractical ? (
																					<div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
																						<div className="bg-blue-50 p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold text-blue-800">
																							{mark.theoryMaxMarks}
																						</div>
																						<div className="bg-green-50 p-1 sm:p-2 rounded text-xs sm:text-sm font-semibold text-green-800">
																							{mark.practicalMaxMarks}
																						</div>
																					</div>
																				) : (
																					<div className="text-center font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">
																						{mark.maxMarks}
																					</div>
																				)}
																			</td>
																			<td className="border border-gray-300 px-1 sm:px-2 lg:px-4 py-2 sm:py-3">
																				{mark.hasPractical ? (
																					<div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
																						<div
																							className={`p-1 sm:p-2 rounded text-xs sm:text-sm font-bold ${
																								mark.isTheoryPassed
																									? "bg-blue-100 text-blue-800"
																									: "bg-red-100 text-red-800"
																							}`}
																						>
																							{mark.theoryMarks}
																							<div className="text-xs mt-1 hidden sm:block">
																								{mark.isTheoryPassed
																									? "✓ Pass"
																									: "✗ Fail"}
																							</div>
																						</div>
																						<div
																							className={`p-1 sm:p-2 rounded text-xs sm:text-sm font-bold ${
																								mark.isPracticalPassed
																									? "bg-green-100 text-green-800"
																									: "bg-red-100 text-red-800"
																							}`}
																						>
																							{mark.practicalMarks}
																							<div className="text-xs mt-1 hidden sm:block">
																								{mark.isPracticalPassed
																									? "✓ Pass"
																									: "✗ Fail"}
																							</div>
																						</div>
																					</div>
																				) : (
																					<div className="text-center font-bold text-gray-800 text-sm sm:text-base lg:text-lg">
																						{mark.marksObtained}
																					</div>
																				)}
																			</td>
																			<td className="border border-gray-300 px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-center">
																				<div className="font-bold text-sm sm:text-lg lg:text-xl text-gray-800">
																					{mark.marksObtained}
																				</div>
																				<div className="text-xs text-gray-600 mt-1">
																					/ {mark.maxMarks}
																				</div>
																			</td>
																			<td className="border border-gray-300 px-1 sm:px-2 lg:px-4 py-2 sm:py-3 text-center">
																				{mark.isPassed ? (
																					<div className="inline-flex items-center gap-1 sm:gap-2 bg-green-100 text-green-800 px-2 sm:px-3 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm">
																						<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
																						PASS
																					</div>
																				) : (
																					<div className="inline-flex items-center gap-1 sm:gap-2 bg-red-100 text-red-800 px-2 sm:px-3 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm">
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

										{/* Final Result Summary */}
										<div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
											<div className="bg-white border border-gray-200 p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm">
												<div className="text-center">
													<p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
														Total Marks Obtained
													</p>
													<p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
														{result.result.totalMarks}
													</p>
													<p className="text-gray-500 text-xs sm:text-sm">
														out of {result.result.maxTotalMarks}
													</p>
												</div>
											</div>
											<div className="bg-white border border-gray-200 p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm">
												<div className="text-center">
													<p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
														Percentage
													</p>
													<p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
														{result.result.percentage.toFixed(2)}%
													</p>
												</div>
											</div>
											<div className="bg-white border border-gray-200 p-4 sm:p-5 lg:p-6 rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
												<div className="text-center">
													<p className="text-gray-600 text-xs sm:text-sm font-medium mb-2">
														Final Result
													</p>
													<p
														className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
															result.result.isPassed
																? "text-green-700"
																: "text-red-700"
														}`}
													>
														{result.result.isPassed ? "PASS" : "FAIL"}
													</p>
												</div>
											</div>
										</div>

										{/* Official Footer */}
										<div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600 border-t pt-4 sm:pt-6">
											<p className="font-semibold">
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
