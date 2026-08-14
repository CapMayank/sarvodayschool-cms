/** @format */

"use client";

import { useRef, useState } from "react";
import { UploadCloud, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
	const inputRef = useRef<HTMLInputElement>(null);

	const openPicker = () => inputRef.current?.click();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setError("Please select an image file");
			return;
		}

		const maxSize = maxSizeMB * 1024 * 1024;
		if (file.size > maxSize) {
			setError(`File size must be less than ${maxSizeMB}MB`);
			return;
		}

		setError(null);

		const reader = new FileReader();
		reader.onloadend = () => setPreview(reader.result as string);
		reader.readAsDataURL(file);

		onImageSelect(file);

		// Reset input so the same file can be re-selected
		if (inputRef.current) inputRef.current.value = "";
	};

	const handleRemove = () => {
		setPreview(null);
		setError(null);
		onImageRemove();
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div className="space-y-2">
			{/* Hidden file input */}
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
			/>

			{preview ? (
				// ── Filled state: full-width preview with hover overlay ──
				<div className="group relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={preview}
						alt="Preview"
						className="w-full h-full object-cover"
					/>
					{/* Hover overlay */}
					<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
						<Button
							type="button"
							size="sm"
							variant="secondary"
							onClick={openPicker}
							className="gap-2 shadow-lg"
						>
							<RefreshCw className="w-4 h-4" />
							Change
						</Button>
						<Button
							type="button"
							size="sm"
							variant="destructive"
							onClick={handleRemove}
							className="gap-2 shadow-lg"
						>
							<Trash2 className="w-4 h-4" />
							Remove
						</Button>
					</div>
					{/* Corner badge */}
					<div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
						Image selected ✓
					</div>
				</div>
			) : (
				// ── Empty state: dashed upload zone ──
				<button
					type="button"
					onClick={openPicker}
					className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-muted/60 transition-all duration-200 flex flex-col items-center justify-center gap-3 group cursor-pointer"
				>
					<div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors duration-200">
						<UploadCloud className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
					</div>
					<div className="text-center">
						<p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
							{label}
						</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							JPG, PNG, WEBP · Max {maxSizeMB} MB
						</p>
					</div>
				</button>
			)}

			{/* Validation error */}
			{error && (
				<p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
					{error}
				</p>
			)}
		</div>
	);
}
