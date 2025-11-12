/** @format */

"use client";

import React from "react";
import {
	FaFacebook,
	FaTwitter,
	FaWhatsapp,
	FaLinkedin,
	FaLink,
} from "react-icons/fa";
import { toast } from "sonner";

interface ShareButtonsProps {
	title: string;
	slug: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, slug }) => {
	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/news/${slug}`
			: "";

	const copyToClipboard = () => {
		navigator.clipboard.writeText(shareUrl);
		toast.success("Link copied to clipboard!");
	};

	const shareButtons = [
		{
			name: "Facebook",
			icon: FaFacebook,
			color: "bg-blue-600 hover:bg-blue-700",
			url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
				shareUrl
			)}`,
		},
		{
			name: "Twitter",
			icon: FaTwitter,
			color: "bg-sky-500 hover:bg-sky-600",
			url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
				title
			)}&url=${encodeURIComponent(shareUrl)}`,
		},
		{
			name: "WhatsApp",
			icon: FaWhatsapp,
			color: "bg-green-500 hover:bg-green-600",
			url: `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`,
		},
		{
			name: "LinkedIn",
			icon: FaLinkedin,
			color: "bg-blue-700 hover:bg-blue-800",
			url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
				shareUrl
			)}`,
		},
	];

	return (
		<div className="border-t border-b border-gray-200 py-6 my-8">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Share this article
			</h3>
			<div className="flex flex-wrap gap-3">
				{shareButtons.map((button) => {
					const Icon = button.icon;
					return (
						<a
							key={button.name}
							href={button.url}
							target="_blank"
							rel="noopener noreferrer"
							className={`${button.color} text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
						>
							<Icon className="w-5 h-5" />
							<span className="text-sm font-medium">{button.name}</span>
						</a>
					);
				})}
				<button
					onClick={copyToClipboard}
					className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
				>
					<FaLink className="w-5 h-5" />
					<span className="text-sm font-medium">Copy Link</span>
				</button>
			</div>
		</div>
	);
};

export default ShareButtons;
