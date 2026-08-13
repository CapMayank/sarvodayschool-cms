/** @format */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {

	typescript:{
		ignoreBuildErrors: false,
	},
	compress: true,
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
			{
				protocol: "https",
				hostname: "img.icons8.com",
			},
		],
	},
};

export default nextConfig;
