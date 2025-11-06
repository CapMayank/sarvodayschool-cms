/** @format */

"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState, useEffect } from "react";

interface ResumeUploadProps {
	onUploadSuccess: (url: string) => void;
	currentResume?: string;
}

export default function ResumeUpload({
	onUploadSuccess,
	currentResume,
}: ResumeUploadProps) {
	const [resumeUrl, setResumeUrl] = useState(currentResume || "");
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {
		if (currentResume) {
			setResumeUrl(currentResume);
		}
	}, [currentResume]);

	return (
		<div className="space-y-3">
			<CldUploadWidget
				uploadPreset={
					process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
				}
				options={{
					folder: "sarvodaya/resumes",
					maxFiles: 1,
					resourceType: "auto",
					clientAllowedFormats: ["pdf", "doc", "docx"],
					maxFileSize: 5000000, // 5MB
					sources: ["local", "url"],
					autoMinimize: true,
				}}
				onOpen={() => setIsUploading(true)}
				onClose={() => setIsUploading(false)}
				onSuccess={(result: any) => {
					console.log("Resume upload successful:", result);
					const url = result?.info?.secure_url;
					if (url) {
						setResumeUrl(url);
						// Prevent page refresh - use setTimeout to ensure state updates
						setTimeout(() => {
							onUploadSuccess(url);
						}, 0);
					}
					setIsUploading(false);
				}}
				onError={(error: any) => {
					console.error("Upload error:", error);
					setIsUploading(false);
					alert("Upload failed. Supported formats: PDF, DOC, DOCX (Max 5MB)");
				}}
			>
				{({ open }) => {
					const handleClick = (e: React.MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						if (typeof open === "function") {
							open();
						} else {
							console.error("Upload widget not ready");
							alert("Upload widget is not ready. Please refresh the page.");
						}
					};

					return (
						<div>
							<button
								type="button"
								onClick={handleClick}
								disabled={isUploading}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<svg
									className={`w-5 h-5 ${isUploading ? "animate-spin" : ""}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								{isUploading
									? "Uploading..."
									: resumeUrl
									? "Change Resume"
									: "Upload Resume"}
							</button>
							<p className="text-xs text-gray-500 mt-2">
								Supported formats: PDF, DOC, DOCX (Max 5MB)
							</p>
						</div>
					);
				}}
			</CldUploadWidget>

			{resumeUrl && (
				<div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<svg
							className="w-6 h-6 text-blue-600"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7H4v2h11V7zM4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
						</svg>
						<div>
							<p className="text-sm font-medium text-blue-900">
								✓ Resume uploaded
							</p>
							<p className="text-xs text-blue-700">Ready to submit</p>
						</div>
					</div>
					<div className="flex gap-2">
						<a
							href={resumeUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							View
						</a>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setResumeUrl("");
								onUploadSuccess("");
							}}
							className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
						>
							Remove
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
