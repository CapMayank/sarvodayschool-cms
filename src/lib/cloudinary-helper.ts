/**
 * Extract public_id from Cloudinary URL
 *
 * @format
 */

export function extractPublicId(cloudinaryUrl: string): string | null {
	try {
		const urlParts = cloudinaryUrl.split("/");
		const uploadIndex = urlParts.findIndex((part) => part === "upload");

		if (uploadIndex === -1) return null;

		const pathAfterVersion = urlParts.slice(uploadIndex + 2).join("/");
		const publicId = pathAfterVersion.replace(/\.[^/.]+$/, "");

		return publicId;
	} catch (error) {
		console.error("Error extracting public_id:", error);
		return null;
	}
}

/**
 * Delete file from Cloudinary (images or PDFs)
 */
export async function deleteCloudinaryFile(fileUrl: string): Promise<boolean> {
	try {
		const publicId = extractPublicId(fileUrl);

		if (!publicId) {
			console.error("Could not extract public_id from URL:", fileUrl);
			return false;
		}

		const response = await fetch("/api/cloudinary/delete", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ publicId }),
		});

		if (!response.ok) {
			console.error("Failed to delete file from Cloudinary");
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error deleting Cloudinary file:", error);
		return false;
	}
}

// Keep the old function name for backward compatibility
export const deleteCloudinaryImage = deleteCloudinaryFile;

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
	file: File,
	folder: string = "sarvodaya"
): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append(
		"upload_preset",
		process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
	);
	formData.append("folder", folder);

	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	if (!cloudName) {
		throw new Error("Cloudinary cloud name not configured");
	}

	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
		{
			method: "POST",
			body: formData,
		}
	);

	if (!response.ok) {
		throw new Error("Failed to upload image to Cloudinary");
	}

	const data = await response.json();
	return data.secure_url;
}
