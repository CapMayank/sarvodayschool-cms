/** @format */

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Loader2,
	Upload,
	FileSpreadsheet,
	AlertCircle,
	Download,
} from "lucide-react";
import * as XLSX from "xlsx";

interface Class {
	id: number;
	name: string;
	displayName: string;
	subjects: Array<{
		id: number;
		name: string;
		code?: string;
		maxMarks: number;
		passingMarks: number;
		theoryMaxMarks?: number;
		practicalMaxMarks?: number;
		theoryPassingMarks?: number;
		practicalPassingMarks?: number;
		hasPractical: boolean;
		isAdditional: boolean;
	}>;
}

// Get current academic year in the format used by the system
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

export default function BulkUpload() {
	const [loading, setLoading] = useState(false);
	const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
	const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
	const [jsonData, setJsonData] = useState("");
	const [uploadMode, setUploadMode] = useState<"excel" | "json">("excel");
	const [classes, setClasses] = useState<Class[]>([]);
	const [uploadResults, setUploadResults] = useState<{
		message: string;
		totalProcessed: number;
		successCount: number;
		errorCount: number;
		errors: Array<{ rollNumber: string; error: string }>;
	} | null>(null);

	// Load classes on mount
	useEffect(() => {
		loadClasses();
	}, []);

	const loadClasses = async () => {
		try {
			const response = await fetch("/api/result/classes");
			const data = await response.json();
			setClasses(data.classes || []);
			if (data.classes && data.classes.length > 0) {
				setSelectedClassId(data.classes[0].id);
			}
		} catch (error) {
			console.error("Error loading classes:", error);
			toast.error("Failed to load classes");
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!selectedClassId) {
			toast.error("Please select a class first");
			return;
		}

		const selectedClass = classes.find((c) => c.id === selectedClassId);
		if (!selectedClass) {
			toast.error("Selected class not found");
			return;
		}

		try {
			setLoading(true);
			const data = await file.arrayBuffer();
			const workbook = XLSX.read(data);
			const worksheet = workbook.Sheets[workbook.SheetNames[0]];
			const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<
				Record<string, unknown>
			>;

			// Parse Excel data
			const students = jsonData.map((row) => {
				const marks: {
					[key: string]: {
						subjectId: number;
						marksObtained?: number; // For Nursery-8th
						theoryMarks?: number; // For 9th-12th
						practicalMarks?: number; // For 9th-12th
						isAdditional?: boolean; // Track if subject is additional
					};
				} = {};

				// Extract marks for each subject
				selectedClass.subjects.forEach((subject) => {
					// Remove "(Optional)" suffix for matching if present
					const subjectBaseName = subject.name;

					if (subject.hasPractical) {
						// For classes 9-12 with theory+practical
						const theoryColumnName = subject.isAdditional
							? `${subjectBaseName} (Optional) Theory`
							: `${subjectBaseName} Theory`;
						const practicalColumnName = subject.isAdditional
							? `${subjectBaseName} (Optional) Practical`
							: `${subjectBaseName} Practical`;

						const theoryValue = row[theoryColumnName];
						const practicalValue = row[practicalColumnName];

						let theoryMarks: number | undefined;
						let practicalMarks: number | undefined;

						if (
							theoryValue !== undefined &&
							theoryValue !== null &&
							theoryValue !== ""
						) {
							const parsedTheory = parseFloat(theoryValue.toString());
							if (!isNaN(parsedTheory) && isFinite(parsedTheory)) {
								theoryMarks = parsedTheory;
							}
						}

						if (
							practicalValue !== undefined &&
							practicalValue !== null &&
							practicalValue !== ""
						) {
							const parsedPractical = parseFloat(practicalValue.toString());
							if (!isNaN(parsedPractical) && isFinite(parsedPractical)) {
								practicalMarks = parsedPractical;
							}
						}

						// Include subject if at least one mark is provided
						// For additional subjects, marks will only be created if student has opted in (handled in API)
						if (theoryMarks !== undefined || practicalMarks !== undefined) {
							marks[subject.name] = {
								subjectId: subject.id,
								theoryMarks,
								practicalMarks,
								isAdditional: subject.isAdditional,
							};
						}
					} else {
						// For classes Nursery-8th (traditional marking)
						const columnName = subject.isAdditional
							? `${subjectBaseName} (Optional)`
							: subjectBaseName;
						const markValue = row[columnName];

						if (
							markValue !== undefined &&
							markValue !== null &&
							markValue !== ""
						) {
							const parsedMark = parseFloat(markValue.toString());
							if (!isNaN(parsedMark) && isFinite(parsedMark)) {
								marks[subject.name] = {
									subjectId: subject.id,
									marksObtained: parsedMark,
									isAdditional: subject.isAdditional,
								};
							}
						}
					}
				});

				return {
					rollNumber:
						row["Roll Number"]?.toString() ||
						row["rollNumber"]?.toString() ||
						"",
					enrollmentNo:
						row["Enrollment No"]?.toString() ||
						row["enrollmentNo"]?.toString() ||
						"",
					name: row["Name"]?.toString() || row["name"]?.toString() || "",
					fatherName:
						row["Father Name"]?.toString() ||
						row["fatherName"]?.toString() ||
						"",
					dateOfBirth: row["Date of Birth"] || row["dateOfBirth"] || "",
					marks,
				};
			});

			// Validate parsed data
			const invalidStudents = students.filter(
				(s) =>
					!s.rollNumber ||
					!s.enrollmentNo ||
					!s.name ||
					!s.fatherName ||
					!s.dateOfBirth
			);

			if (invalidStudents.length > 0) {
				toast.error(
					`${invalidStudents.length} student(s) have missing required fields. Please check your Excel file.`
				);
				setLoading(false);
				return;
			}

			// Upload to API
			await uploadBulkData(selectedClassId, students);
		} catch (error) {
			console.error("Error processing Excel file:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to process Excel file"
			);
		} finally {
			setLoading(false);
			// Reset file input
			e.target.value = "";
		}
	};

	const uploadBulkData = async (
		classId: number,
		students: Array<{
			rollNumber: string;
			enrollmentNo: string;
			name: string;
			fatherName: string;
			dateOfBirth: string | unknown;
			marks: {
				[key: string]: {
					subjectId: number;
					marksObtained?: number; // For Nursery-8th
					theoryMarks?: number; // For 9th-12th
					practicalMarks?: number; // For 9th-12th
				};
			};
		}>
	) => {
		try {
			const response = await fetch("/api/result/bulk-upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					academicYear,
					classId,
					students,
					clearExisting: false,
				}),
			});

			const data = await response.json();

			if (!response.ok) throw new Error(data.error || "Failed to upload");

			setUploadResults(data);
			toast.success(
				`Successfully processed ${data.successCount} out of ${data.totalProcessed} students`
			);

			if (data.errorCount > 0) {
				toast.warning(`${data.errorCount} students had errors`);
			}
		} catch (error) {
			console.error("Error in bulk upload:", error);
			throw error;
		}
	};

	const handleJsonUpload = async () => {
		if (!academicYear || !jsonData) {
			toast.error("Please provide academic year and JSON data");
			return;
		}

		try {
			setLoading(true);
			const parsedData = JSON.parse(jsonData);

			const response = await fetch("/api/result/bulk-upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					academicYear,
					classId: parsedData.classId,
					students: parsedData.students,
					clearExisting: parsedData.clearExisting || false,
				}),
			});

			const data = await response.json();

			if (!response.ok) throw new Error(data.error || "Failed to upload");

			setUploadResults(data);
			toast.success(
				`Successfully processed ${data.successCount} out of ${data.totalProcessed} students`
			);

			if (data.errorCount > 0) {
				toast.warning(`${data.errorCount} students had errors`);
			}
		} catch (error) {
			console.error("Error in bulk upload:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to process bulk upload"
			);
		} finally {
			setLoading(false);
		}
	};

	const downloadExcelTemplate = () => {
		if (!selectedClassId) {
			toast.error("Please select a class first");
			return;
		}

		const selectedClass = classes.find((c) => c.id === selectedClassId);
		if (!selectedClass) {
			toast.error("Selected class not found");
			return;
		}

		// Create template headers
		const baseHeaders = [
			"Roll Number",
			"Enrollment No",
			"Name",
			"Father Name",
			"Date of Birth",
		];

		// Generate subject headers based on theory/practical structure
		const subjectHeaders: string[] = [];
		const sampleMarks: string[] = [];
		const hasAdditionalSubjects = selectedClass.subjects.some(
			(s) => s.isAdditional
		);

		selectedClass.subjects.forEach((subject) => {
			const subjectLabel = subject.isAdditional
				? `${subject.name} (Optional)`
				: subject.name;

			if (subject.hasPractical) {
				// For classes 9-12 with theory+practical
				subjectHeaders.push(`${subjectLabel} Theory`);
				subjectHeaders.push(`${subjectLabel} Practical`);
				sampleMarks.push("0", "0");
			} else {
				// For classes Nursery-8th (traditional marking)
				subjectHeaders.push(subjectLabel);
				sampleMarks.push("0");
			}
		});

		const headers = [...baseHeaders, ...subjectHeaders];

		const sampleData = [
			[
				"001",
				"EN001",
				"Student Name",
				"Father Name",
				"2008-01-15",
				...sampleMarks,
			],
		];

		// Add instructions row if there are additional subjects
		if (hasAdditionalSubjects) {
			const instructionRow = [
				"INSTRUCTIONS:",
				"For optional subjects,",
				"leave blank if student",
				"has not opted for that",
				"subject",
				...Array(subjectHeaders.length).fill(""),
			];
			sampleData.unshift(instructionRow);
		}

		const worksheetData = [headers, ...sampleData];
		const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

		// Download
		XLSX.writeFile(
			workbook,
			`result_template_${selectedClass.displayName.replace(/\s+/g, "_")}.xlsx`
		);
		toast.success("Template downloaded successfully");
	};

	const selectedClass = classes.find((c) => c.id === selectedClassId);

	return (
		<div className="space-y-6">
			{/* Mode Selector */}
			<div className="flex gap-4 border-b pb-4">
				<button
					onClick={() => setUploadMode("excel")}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${
						uploadMode === "excel"
							? "bg-blue-600 text-white"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}
				>
					<FileSpreadsheet className="inline h-4 w-4 mr-2" />
					Excel Upload
				</button>
				<button
					onClick={() => setUploadMode("json")}
					className={`px-4 py-2 rounded-lg font-medium transition-colors ${
						uploadMode === "json"
							? "bg-blue-600 text-white"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}
				>
					JSON Upload
				</button>
			</div>

			{uploadMode === "excel" ? (
				<>
					{/* Excel Upload Instructions */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex gap-3">
							<AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
							<div className="space-y-2">
								<h4 className="font-semibold text-blue-900">
									Excel Upload Instructions
								</h4>
								<div className="text-sm text-blue-800 space-y-1">
									<p>1. Select a class from the dropdown below</p>
									<p>
										2. Click &quot;Download Template&quot; to get an Excel file
										with the correct column structure
									</p>
									<p>
										3. Fill in student data with the following required columns:
									</p>
									<ul className="list-disc list-inside pl-4 space-y-1">
										<li>Roll Number</li>
										<li>Enrollment No</li>
										<li>Name</li>
										<li>Father Name</li>
										<li>
											Date of Birth (format: YYYY-MM-DD, e.g., 2008-01-15)
										</li>
										<li>
											Subject columns (automatically included in template)
										</li>
										{selectedClass &&
											selectedClass.subjects.some((s) => s.hasPractical) && (
												<li className="text-orange-700 font-medium">
													📝 For classes 9-12: Subjects will have separate
													Theory and Practical columns
												</li>
											)}
									</ul>
									<p>
										4. Enter marks for each subject (leave blank if not
										applicable)
									</p>
									<p>
										5. Save your Excel file and upload it using the button below
									</p>
									{selectedClass &&
										selectedClass.subjects.some((s) => s.hasPractical) && (
											<div className="bg-orange-100 border border-orange-300 rounded p-2 mt-2">
												<p className="font-medium text-orange-800">
													Note for Classes 9-12: Each subject has Theory and
													Practical components. Both components must pass
													individually for the subject to be considered passed.
												</p>
											</div>
										)}
								</div>
							</div>
						</div>
					</div>

					{/* Class Selection and Template Download */}
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label>Academic Year</Label>
								<Input
									value={academicYear}
									onChange={(e) => setAcademicYear(e.target.value)}
									placeholder="2024-25"
								/>
							</div>
							<div>
								<Label>Select Class</Label>
								<select
									value={selectedClassId || ""}
									onChange={(e) => setSelectedClassId(Number(e.target.value))}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select a class</option>
									{classes.map((cls) => (
										<option key={cls.id} value={cls.id}>
											{cls.displayName}
										</option>
									))}
								</select>
							</div>
						</div>

						{selectedClass && (
							<div className="bg-gray-50 border rounded-lg p-4 space-y-2">
								<h4 className="font-semibold">
									Selected Class: {selectedClass.displayName}
								</h4>
								<p className="text-sm text-gray-600">
									Subjects ({selectedClass.subjects.length}):{" "}
									{selectedClass.subjects.map((s) => s.name).join(", ")}
								</p>
								<Button
									onClick={downloadExcelTemplate}
									variant="outline"
									className="mt-2"
								>
									<Download className="h-4 w-4 mr-2" />
									Download Excel Template
								</Button>
							</div>
						)}

						{/* File Upload */}
						<div className="space-y-2">
							<Label>Upload Excel File</Label>
							<Input
								type="file"
								accept=".xlsx,.xls"
								onChange={handleFileUpload}
								disabled={loading || !selectedClassId}
							/>
							{loading && (
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Loader2 className="h-4 w-4 animate-spin" />
									Processing Excel file...
								</div>
							)}
						</div>
					</div>
				</>
			) : (
				<>
					{/* JSON Upload Instructions */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex gap-3">
							<AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
							<div className="space-y-2">
								<h4 className="font-semibold text-blue-900">
									JSON Upload Instructions
								</h4>
								<div className="text-sm text-blue-800 space-y-1">
									<p>
										1. First, create classes and subjects in the Classes &amp;
										Subjects tab
									</p>
									<p>2. Prepare your JSON data with the following structure:</p>
									<pre className="bg-white p-2 rounded mt-2 text-xs overflow-x-auto">
										{`{
  "classId": 1,
  "clearExisting": false,
  "students": [
    {
      "rollNumber": "001",
      "enrollmentNo": "EN001",
      "name": "Student Name",
      "fatherName": "Father Name",
      "dateOfBirth": "2008-01-15",
      "marks": {
        "Mathematics": 85,
        "Science": 90,
        "English": 78
      }
    }
  ]
}`}
									</pre>
									<p className="mt-2">
										3. The subject names in marks must match exactly with the
										subjects defined for the class
									</p>
									<p>
										4. Set clearExisting to true if you want to delete existing
										results for this academic year before uploading
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* JSON Upload Form */}
					<div className="space-y-4">
						<div>
							<Label>Academic Year</Label>
							<Input
								value={academicYear}
								onChange={(e) => setAcademicYear(e.target.value)}
								placeholder="2024-25"
							/>
						</div>

						<div>
							<Label>JSON Data</Label>
							<Textarea
								value={jsonData}
								onChange={(e) => setJsonData(e.target.value)}
								placeholder="Paste your JSON data here..."
								rows={15}
								className="font-mono text-sm"
							/>
						</div>

						<Button onClick={handleJsonUpload} disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<Upload className="h-4 w-4 mr-2" />
									Upload Results
								</>
							)}
						</Button>
					</div>
				</>
			)}

			{/* Upload Results */}
			{uploadResults && (
				<div className="border rounded-lg p-4 bg-gray-50 space-y-3">
					<h4 className="font-semibold flex items-center gap-2">
						<FileSpreadsheet className="h-5 w-5" />
						Upload Results
					</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-white p-3 rounded border">
							<p className="text-sm text-gray-600">Total Processed</p>
							<p className="text-2xl font-bold">
								{uploadResults.totalProcessed}
							</p>
						</div>
						<div className="bg-green-50 p-3 rounded border border-green-200">
							<p className="text-sm text-green-600">Successful</p>
							<p className="text-2xl font-bold text-green-700">
								{uploadResults.successCount}
							</p>
						</div>
						<div className="bg-red-50 p-3 rounded border border-red-200">
							<p className="text-sm text-red-600">Errors</p>
							<p className="text-2xl font-bold text-red-700">
								{uploadResults.errorCount}
							</p>
						</div>
					</div>

					{uploadResults.errors && uploadResults.errors.length > 0 && (
						<div className="space-y-2">
							<h5 className="font-medium text-red-700">Errors:</h5>
							<div className="max-h-64 overflow-y-auto space-y-1">
								{uploadResults.errors.map((error, index: number) => (
									<div
										key={index}
										className="text-sm bg-red-50 p-2 rounded border border-red-200"
									>
										<span className="font-medium">
											Roll No: {error.rollNumber || "Unknown"}
										</span>{" "}
										- {error.error}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
