/** @format */

"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";
import Image from "next/image";
import { UploadCloud, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
	const [prevImage, setPrevImage] = useState(currentImage);

	// Sync when parent resets the form
	if (currentImage !== prevImage) {
		setPrevImage(currentImage);
		setImageUrl(currentImage || "");
	}

	const handleRemove = () => {
		if (imageUrl && imageUrl !== currentImage) {
			import("@/lib/cloudinary-helper").then(({ deleteCloudinaryImage }) => {
				deleteCloudinaryImage(imageUrl).catch(console.error);
			});
		}
		setImageUrl("");
		onUploadSuccess("");
	};

	return (
		<CldUploadWidget
			uploadPreset={
				process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
			}
			options={{
				folder,
				maxFiles: 1,
				resourceType: "image",
				clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
				maxFileSize: 10000000,
				sources: ["local", "url", "camera"],
				showSkipCropButton: false,
				cropping: false,
			}}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onSuccess={(result: any) => {
				const url = result?.info?.secure_url;
				if (url) {
					if (imageUrl && imageUrl !== currentImage) {
						import("@/lib/cloudinary-helper").then(({ deleteCloudinaryImage }) => {
							deleteCloudinaryImage(imageUrl).catch(console.error);
						});
					}
					setImageUrl(url);
					onUploadSuccess(url);
				}
			}}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onError={(error: any) => {
				console.error("Upload error:", error);
				alert("Upload failed. Please try again or check your Cloudinary settings.");
			}}
		>
			{({ open }) => {
				const handleOpen = () => {
					if (typeof open === "function") {
						open();
					} else {
						console.error("Cloudinary widget not ready");
						alert("Upload widget is not ready. Please refresh the page.");
					}
				};

				// ── Filled state: image preview with hover overlay ──
				if (imageUrl) {
					return (
						<div className="group relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted">
							<Image
								src={imageUrl}
								alt="Uploaded image preview"
								fill
								className="object-cover"
							/>
							{/* Hover overlay */}
							<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
								<Button
									type="button"
									size="sm"
									variant="secondary"
									onClick={handleOpen}
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
								Image uploaded ✓
							</div>
						</div>
					);
				}

				// ── Empty state: dashed upload zone ──
				return (
					<button
						type="button"
						onClick={handleOpen}
						className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-muted/60 transition-all duration-200 flex flex-col items-center justify-center gap-3 group cursor-pointer"
					>
						<div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors duration-200">
							<UploadCloud className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
						</div>
						<div className="text-center">
							<p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
								Click to upload image
							</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								JPG, PNG, WEBP · Max 10 MB
							</p>
						</div>
					</button>
				);
			}}
		</CldUploadWidget>
	);
}
