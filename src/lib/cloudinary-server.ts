import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract public_id from Cloudinary URL
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
 * Delete a file from Cloudinary given its URL.
 * Designed to be called directly from server-side API routes.
 */
export async function deleteCloudinaryFileServer(fileUrl: string): Promise<boolean> {
	try {
		const publicId = extractPublicId(fileUrl);

		if (!publicId) {
			console.error("Could not extract public_id from URL:", fileUrl);
			return false;
		}

		const result = await cloudinary.uploader.destroy(publicId);
		return result.result === "ok";
	} catch (error) {
		console.error("Error deleting Cloudinary file from server:", error);
		return false;
	}
}
