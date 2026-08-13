export function getCloudinaryBlurUrl(url: string | undefined): string | undefined {
	if (!url) return undefined;

	// Check if it's a Cloudinary URL
	if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
		// Insert the blur transformation parameters after /upload/
		// e.g., .../upload/v1234/file.jpg -> .../upload/w_10,e_blur:1000/v1234/file.jpg
		return url.replace("/upload/", "/upload/w_10,e_blur:1000,f_webp,q_auto/");
	}

	return undefined;
}
