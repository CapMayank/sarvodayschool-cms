/** @format */

"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState, useEffect } from "react";
import Image from "next/image";

interface CloudinaryUploadProps {
	onUploadSuccess: (url: string) => void;
	currentImage?: string;
	folder?: string;
}

export default function CloudinaryUpload({
	onUploadSuccess,
	currentImage,
	folder = "sarvodaya",
}: CloudinaryUploadProps) {
	const [imageUrl, setImageUrl] = useState(currentImage || "");

	// Update imageUrl when currentImage prop changes
	useEffect(() => {
		setImageUrl(currentImage || "");
	}, [currentImage]);

	return (
		<div className="space-y-3">
			<CldUploadWidget
				uploadPreset={
					process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
				}
				options={{
					folder: folder, // This will organize uploads into subfolders
					maxFiles: 1,
					resourceType: "image",
					clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
					maxFileSize: 10000000, // 10MB
					sources: ["local", "url", "camera"],
					showSkipCropButton: false,
					cropping: false,
				}}
				onSuccess={(result: any) => {
					console.log("Upload successful:", result);
					const url = result?.info?.secure_url;
					if (url) {
						setImageUrl(url);
						onUploadSuccess(url);
					}
				}}
				onError={(error: any) => {
					console.error("Upload error:", error);
					alert(
						"Upload failed. Please try again or check your Cloudinary settings."
					);
				}}
			>
				{({ open }) => {
					const handleClick = () => {
						if (typeof open === "function") {
							open();
						} else {
							console.error("Cloudinary widget not ready");
							alert("Upload widget is not ready. Please refresh the page.");
						}
					};

					return (
						<div>
							<button
								type="button"
								onClick={handleClick}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
								{imageUrl ? "Change Image" : "Upload Image"}
							</button>
							<p className="text-xs text-gray-500 mt-1">
								Will upload to: <span className="font-mono">{folder}</span>
							</p>
						</div>
					);
				}}
			</CldUploadWidget>

			{imageUrl && (
				<div className="relative inline-block">
					<img
						src={imageUrl}
						alt="Preview"
						className="w-full max-w-sm h-48 object-cover rounded-lg border-2 border-gray-200"
					/>

					<button
						type="button"
						onClick={() => {
							setImageUrl("");
							onUploadSuccess("");
						}}
						className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
						title="Remove image"
					>
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>
			)}
		</div>
	);
}
