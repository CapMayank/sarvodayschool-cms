/** @format */

"use client";

import { useState } from "react";
import { Upload, FileText, X, Eye } from "lucide-react";

interface ResumeUploadProps {
	onFileSelect: (file: File | null) => void;
	currentResume?: string;
}

export default function ResumeUpload({
	onFileSelect,
	currentResume,
}: ResumeUploadProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (!file) {
			return;
		}

		// Validate file type
		const validTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		if (!validTypes.includes(file.type)) {
			alert("Please upload a valid file format (PDF, DOC, or DOCX)");
			// Reset input so same file can be selected again
			e.target.value = "";
			return;
		}

		// Validate file size (5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert("File size must be less than 5MB");
			// Reset input so same file can be selected again
			e.target.value = "";
			return;
		}

		// File is valid, update state
		setSelectedFile(file);
		onFileSelect(file);

		// Clear the input value so the same file can be selected again if removed
		// This ensures onChange always fires
		setTimeout(() => {
			if (e.target) {
				e.target.value = "";
			}
		}, 100);
	};

	const handleRemove = () => {
		setSelectedFile(null);
		onFileSelect(null);

		// Reset file input
		const fileInput = document.getElementById(
			"resume-upload"
		) as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const getFileName = () => {
		if (selectedFile) {
			return selectedFile.name;
		}
		if (currentResume) {
			// Extract filename from URL
			const urlParts = currentResume.split("/");
			return urlParts[urlParts.length - 1] || "Current Resume";
		}
		return "";
	};

	const getFileSize = () => {
		if (selectedFile) {
			const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
			return `${sizeInMB} MB`;
		}
		return "";
	};

	const hasFile = selectedFile || currentResume;

	return (
		<div className="space-y-3">
			<div>
				<label
					htmlFor="resume-upload"
					className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
				>
					<Upload className="w-5 h-5" />
					{selectedFile || currentResume ? "Change Resume" : "Select Resume"}
				</label>
				<input
					id="resume-upload"
					type="file"
					accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					onChange={handleFileChange}
					className="hidden"
				/>
				<p className="text-xs text-gray-500 mt-2">
					Supported formats: PDF, DOC, DOCX (Max 5MB)
				</p>
			</div>

			{hasFile && (
				<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-start gap-3 flex-1 min-w-0">
							<FileText className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-blue-900 truncate">
									{selectedFile ? "✓ Resume selected" : "✓ Resume uploaded"}
								</p>
								<p
									className="text-xs text-blue-700 truncate"
									title={getFileName()}
								>
									{getFileName()}
								</p>
								{selectedFile && (
									<p className="text-xs text-blue-600 mt-0.5">
										{getFileSize()} • Will upload on form submission
									</p>
								)}
								{currentResume && !selectedFile && (
									<p className="text-xs text-blue-600 mt-0.5">
										Currently uploaded
									</p>
								)}
							</div>
						</div>
						<div className="flex gap-2 shrink-0">
							{currentResume && !selectedFile && (
								<a
									href={currentResume}
									target="_blank"
									rel="noopener noreferrer"
									className="p-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
									title="View current resume"
								>
									<Eye className="w-4 h-4" />
								</a>
							)}
							<button
								type="button"
								onClick={handleRemove}
								className="p-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
								title="Remove"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
