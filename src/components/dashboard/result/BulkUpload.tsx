/** @format */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

export default function BulkUpload() {
	const [loading, setLoading] = useState(false);
	const [academicYear, setAcademicYear] = useState("2024-25");
	const [jsonData, setJsonData] = useState("");
	const [uploadResults, setUploadResults] = useState<{
		message: string;
		totalProcessed: number;
		successCount: number;
		errorCount: number;
		errors: Array<{ rollNumber: string; error: string }>;
	} | null>(null);

	const handleBulkUpload = async () => {
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

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div className="flex gap-3">
					<AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
					<div className="space-y-2">
						<h4 className="font-semibold text-blue-900">
							Bulk Upload Instructions
						</h4>
						<div className="text-sm text-blue-800 space-y-1">
							<p>
								1. First, create classes and subjects in the Classes &amp; Subjects tab
							</p>
							<p>
								2. Prepare your JSON data with the following structure:
							</p>
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
								3. The subject names in marks must match exactly with the subjects defined for the class
							</p>
							<p>
								4. Set clearExisting to true if you want to delete existing results for this academic year before uploading
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Upload Form */}
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

				<Button onClick={handleBulkUpload} disabled={loading}>
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
							<p className="text-2xl font-bold">{uploadResults.totalProcessed}</p>
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
