/** @format */

"use client";

import React from "react";
import { FaYoutube, FaFacebook, FaInstagram, FaLink } from "react-icons/fa";
import { SiX } from "react-icons/si";

interface Link {
	type: string;
	url: string;
	title: string;
}

interface SocialLinksProps {
	links?: Link[];
}

const SocialLinks: React.FC<SocialLinksProps> = ({ links }) => {
	if (!links || links.length === 0) return null;

	// Filter out video links (they're shown in VideoEmbed component)
	const socialLinks = links.filter(
		(link) =>
			link.type !== "youtube" &&
			!(link.type === "facebook" && link.url.includes("videos")) &&
			!link.url.includes("youtube.com") &&
			!link.url.includes("youtu.be")
	);

	if (socialLinks.length === 0) return null;

	const getIcon = (type: string, url: string) => {
		const lowerType = type.toLowerCase();
		const lowerUrl = url.toLowerCase();

		if (lowerType.includes("facebook") || lowerUrl.includes("facebook.com"))
			return <FaFacebook className="w-5 h-5" />;
		if (lowerType.includes("twitter") || lowerUrl.includes("twitter.com"))
			return <SiX className="w-5 h-5" />;
		if (lowerType.includes("instagram") || lowerUrl.includes("instagram.com"))
			return <FaInstagram className="w-5 h-5" />;
		if (lowerType.includes("youtube") || lowerUrl.includes("youtube.com"))
			return <FaYoutube className="w-5 h-5" />;
		return <FaLink className="w-5 h-5" />;
	};

	const getColor = (type: string, url: string) => {
		const lowerType = type.toLowerCase();
		const lowerUrl = url.toLowerCase();

		if (lowerType.includes("facebook") || lowerUrl.includes("facebook.com"))
			return "bg-blue-600 hover:bg-blue-700";
		if (lowerType.includes("twitter") || lowerUrl.includes("twitter.com"))
			return "bg-gray-900 hover:bg-gray-800";
		if (lowerType.includes("instagram") || lowerUrl.includes("instagram.com"))
			return "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700";
		if (lowerType.includes("youtube") || lowerUrl.includes("youtube.com"))
			return "bg-red-600 hover:bg-red-700";
		return "bg-gray-600 hover:bg-gray-700";
	};

	return (
		<div className="my-8">
			<h3 className="text-2xl font-bold text-gray-900 mb-4">Related Links</h3>
			<div className="flex flex-wrap gap-3">
				{socialLinks.map((link, index) => (
					<a
						key={index}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						className={`${getColor(
							link.type,
							link.url
						)} text-white px-4 py-3 rounded-lg flex items-center gap-3 transition-colors shadow-md hover:shadow-lg`}
					>
						{getIcon(link.type, link.url)}
						<span className="font-medium">{link.title || link.type}</span>
					</a>
				))}
			</div>
		</div>
	);
};

export default SocialLinks;
