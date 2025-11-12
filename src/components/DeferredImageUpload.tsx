/** @format */

"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";

interface DeferredImageUploadProps {
	onImageSelect: (file: File) => void;
	onImageRemove: () => void;
	previewUrl?: string;
	label?: string;
	maxSizeMB?: number;
}

export default function DeferredImageUpload({
	onImageSelect,
	onImageRemove,
	previewUrl,
	label = "Upload Image",
	maxSizeMB = 10,
}: DeferredImageUploadProps) {
	const [preview, setPreview] = useState<string | null>(previewUrl || null);
	const [error, setError] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			setError("Please select an image file");
			return;
		}

		// Validate file size
		const maxSize = maxSizeMB * 1024 * 1024;
		if (file.size > maxSize) {
			setError(`File size must be less than ${maxSizeMB}MB`);
			return;
		}

		setError(null);

		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setPreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		// Pass file to parent
		onImageSelect(file);
	};

	const handleRemove = () => {
		setPreview(null);
		setError(null);
		onImageRemove();
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-3">
				<label className="cursor-pointer">
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className="hidden"
					/>
					<div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
						<Upload className="w-5 h-5" />
						{preview ? "Change Image" : label}
					</div>
				</label>
				<p className="text-xs text-gray-500">
					Max {maxSizeMB}MB • JPG, PNG, WEBP, GIF
				</p>
			</div>

			{error && (
				<div className="text-sm text-red-600 bg-red-50 p-2 rounded">
					{error}
				</div>
			)}

			{preview && (
				<div className="relative inline-block">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={preview}
						alt="Preview"
						className="w-full max-w-sm h-48 object-cover rounded-lg border-2 border-gray-200"
					/>
					<button
						type="button"
						onClick={handleRemove}
						className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg transition-colors"
						title="Remove image"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			)}
		</div>
	);
}
