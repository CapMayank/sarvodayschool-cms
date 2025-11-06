/** @format */

"use client";

import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Download, CheckCircle, XCircle } from "lucide-react";

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
		}>;
	};
}

export default function ResultSearchPage() {
	const [searchData, setSearchData] = useState({
		rollNumber: "",
		enrollmentNo: "",
		dateOfBirth: "",
		academicYear: "2024-25",
	});
	const [searching, setSearching] = useState(false);
	const [result, setResult] = useState<SearchResult | null>(null);
	const [useEnrollment, setUseEnrollment] = useState(true);

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

	const handleDownloadPDF = () => {
		if (!result) return;
		toast.info("PDF download feature will be implemented soon");
		// PDF download will be implemented in next iteration
	};

	return (
		<>
			<Header title="Search Result" />
			<div className="min-h-screen bg-gray-100 py-8 px-4">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Search Form */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Search className="h-5 w-5" />
								Search Your Result
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label>Roll Number *</Label>
									<Input
										value={searchData.rollNumber}
										onChange={(e) =>
											setSearchData({
												...searchData,
												rollNumber: e.target.value,
											})
										}
										placeholder="Enter your roll number"
									/>
								</div>
								<div>
									<Label>Academic Year *</Label>
									<Input
										value={searchData.academicYear}
										onChange={(e) =>
											setSearchData({
												...searchData,
												academicYear: e.target.value,
											})
										}
										placeholder="2024-25"
									/>
								</div>
							</div>

							{/* Toggle between Enrollment No and DOB */}
							<div className="flex items-center gap-4">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										checked={useEnrollment}
										onChange={() => {
											setUseEnrollment(true);
											setSearchData({ ...searchData, dateOfBirth: "" });
										}}
										className="h-4 w-4"
									/>
									<span>Use Enrollment Number</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										checked={!useEnrollment}
										onChange={() => {
											setUseEnrollment(false);
											setSearchData({ ...searchData, enrollmentNo: "" });
										}}
										className="h-4 w-4"
									/>
									<span>Use Date of Birth</span>
								</label>
							</div>

							{useEnrollment ? (
								<div>
									<Label>Enrollment Number *</Label>
									<Input
										value={searchData.enrollmentNo}
										onChange={(e) =>
											setSearchData({
												...searchData,
												enrollmentNo: e.target.value,
											})
										}
										placeholder="Enter your enrollment number"
									/>
								</div>
							) : (
								<div>
									<Label>Date of Birth *</Label>
									<Input
										type="date"
										value={searchData.dateOfBirth}
										onChange={(e) =>
											setSearchData({
												...searchData,
												dateOfBirth: e.target.value,
											})
										}
									/>
								</div>
							)}

							<Button
								onClick={handleSearch}
								disabled={searching}
								className="w-full"
							>
								{searching ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Searching...
									</>
								) : (
									<>
										<Search className="h-4 w-4 mr-2" />
										Search Result
									</>
								)}
							</Button>
						</CardContent>
					</Card>

					{/* Result Display */}
					{result && (
						<Card>
							<CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
								<div className="flex justify-between items-center">
									<div>
										<CardTitle className="text-2xl">
											Annual Examination Result
										</CardTitle>
										<p className="text-blue-100 mt-1">
											Academic Year: {searchData.academicYear}
										</p>
									</div>
									<Button
										variant="outline"
										className="bg-white text-blue-700 hover:bg-blue-50"
										onClick={handleDownloadPDF}
									>
										<Download className="h-4 w-4 mr-2" />
										Download PDF
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-6 pt-6">
								{/* Student Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-600">Student Name</p>
										<p className="font-semibold text-lg">{result.student.name}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Father&apos;s Name</p>
										<p className="font-semibold text-lg">
											{result.student.fatherName}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Roll Number</p>
										<p className="font-semibold">{result.student.rollNumber}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Enrollment Number</p>
										<p className="font-semibold">
											{result.student.enrollmentNo}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Class</p>
										<p className="font-semibold">{result.student.class}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Date of Birth</p>
										<p className="font-semibold">
											{new Date(result.student.dateOfBirth).toLocaleDateString()}
										</p>
									</div>
								</div>

								{/* Marks Table */}
								<div className="overflow-x-auto">
									<table className="w-full border-collapse border border-gray-300">
										<thead className="bg-gray-100">
											<tr>
												<th className="border border-gray-300 px-4 py-2 text-left">
													Subject
												</th>
												<th className="border border-gray-300 px-4 py-2 text-center">
													Max Marks
												</th>
												<th className="border border-gray-300 px-4 py-2 text-center">
													Marks Obtained
												</th>
												<th className="border border-gray-300 px-4 py-2 text-center">
													Status
												</th>
											</tr>
										</thead>
										<tbody>
											{result.result.subjectMarks.map((mark, index) => (
												<tr
													key={index}
													className={
														!mark.isPassed ? "bg-red-50" : ""
													}
												>
													<td className="border border-gray-300 px-4 py-2">
														{mark.subject}
														{mark.isAdditional && (
															<span className="ml-2 text-xs text-blue-600">
																(Additional)
															</span>
														)}
													</td>
													<td className="border border-gray-300 px-4 py-2 text-center">
														{mark.maxMarks}
													</td>
													<td className="border border-gray-300 px-4 py-2 text-center font-semibold">
														{mark.marksObtained}
													</td>
													<td className="border border-gray-300 px-4 py-2 text-center">
														{mark.isPassed ? (
															<span className="inline-flex items-center gap-1 text-green-600">
																<CheckCircle className="h-4 w-4" />
																Pass
															</span>
														) : (
															<span className="inline-flex items-center gap-1 text-red-600">
																<XCircle className="h-4 w-4" />
																Fail
															</span>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Summary */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
									<div className="bg-blue-50 p-4 rounded-lg">
										<p className="text-sm text-blue-600">Total Marks</p>
										<p className="text-2xl font-bold text-blue-700">
											{result.result.totalMarks} / {result.result.maxTotalMarks}
										</p>
									</div>
									<div className="bg-purple-50 p-4 rounded-lg">
										<p className="text-sm text-purple-600">Percentage</p>
										<p className="text-2xl font-bold text-purple-700">
											{result.result.percentage.toFixed(2)}%
										</p>
									</div>
									<div
										className={`p-4 rounded-lg ${
											result.result.isPassed
												? "bg-green-50"
												: "bg-red-50"
										}`}
									>
										<p
											className={`text-sm ${
												result.result.isPassed
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											Result
										</p>
										<p
											className={`text-2xl font-bold ${
												result.result.isPassed
													? "text-green-700"
													: "text-red-700"
											}`}
										>
											{result.result.isPassed ? "PASS" : "FAIL"}
										</p>
									</div>
								</div>

								{/* Congratulations/Encouragement Message */}
								<div
									className={`p-4 rounded-lg border-l-4 ${
										result.result.isPassed
											? "bg-green-50 border-green-500"
											: "bg-yellow-50 border-yellow-500"
									}`}
								>
									{result.result.isPassed ? (
										<p className="text-green-800">
											🎉 Congratulations {result.student.name}! You have
											successfully passed the examination. Keep up the excellent
											work!
										</p>
									) : (
										<p className="text-yellow-800">
											Keep working hard, {result.student.name}. Success comes
											to those who persevere. Better luck next time!
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
}
