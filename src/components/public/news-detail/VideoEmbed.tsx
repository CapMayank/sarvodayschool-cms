/** @format */

"use client";

import React from "react";
import { FaFacebook } from "react-icons/fa";

interface Link {
	type: string;
	url: string;
	title: string;
}

interface VideoEmbedProps {
	links?: Link[];
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ links }) => {
	if (!links || links.length === 0) return null;

	// Extract YouTube video ID from URL
	const getYouTubeId = (url: string): string | null => {
		const regExp =
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

	// Extract YouTube playlist ID from URL
	const getYouTubePlaylistId = (url: string): string | null => {
		const regExp = /[?&]list=([^#&?]*)/;
		const match = url.match(regExp);
		return match ? match[1] : null;
	};

	// Extract Facebook video ID from URL
	const getFacebookVideoUrl = (url: string): string | null => {
		if (url.includes("facebook.com") && url.includes("videos")) {
			return url;
		}
		return null;
	};

	// Filter video links
	const videoLinks = links.filter(
		(link) =>
			link.type === "youtube" ||
			link.type === "youtube-playlist" ||
			(link.type === "facebook" && link.url.includes("videos")) ||
			link.url.includes("youtube.com") ||
			link.url.includes("youtu.be") ||
			(link.url.includes("facebook.com") && link.url.includes("videos"))
	);

	if (videoLinks.length === 0) return null;

	return (
		<div className="my-8">
			<h3 className="text-2xl font-bold text-gray-900 mb-4">Videos & Playlists</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{videoLinks.map((link, index) => {
					// Handle YouTube Playlist
					if (link.type === "youtube-playlist") {
						const playlistId = getYouTubePlaylistId(link.url);
						if (playlistId) {
							return (
								<div key={index} className="space-y-2">
									<div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden shadow-lg">
										<iframe
											className="absolute top-0 left-0 w-full h-full"
											src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
											title={link.title || "YouTube playlist"}
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
										></iframe>
									</div>
									{link.title && (
										<div className="flex items-center gap-2">
											<span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-semibold">
												PLAYLIST
											</span>
											<p className="text-sm text-gray-600 font-medium">
												{link.title}
											</p>
										</div>
									)}
								</div>
							);
						}
					}

					// Handle YouTube Video
					const youtubeId = getYouTubeId(link.url);
					const facebookUrl = getFacebookVideoUrl(link.url);

					if (youtubeId) {
						return (
							<div key={index} className="space-y-2">
								<div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden shadow-lg">
									<iframe
										className="absolute top-0 left-0 w-full h-full"
										src={`https://www.youtube.com/embed/${youtubeId}`}
										title={link.title || "YouTube video"}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
									></iframe>
								</div>
								{link.title && (
									<p className="text-sm text-gray-600 font-medium">
										{link.title}
									</p>
								)}
							</div>
						);
					}

					if (facebookUrl) {
						return (
							<div key={index} className="space-y-2">
								<div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
									<a
										href={facebookUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="absolute inset-0 flex items-center justify-center hover:bg-gray-200 transition-colors"
									>
										<FaFacebook className="w-16 h-16 text-blue-600" />
									</a>
								</div>
								{link.title && (
									<p className="text-sm text-gray-600 font-medium">
										{link.title}
									</p>
								)}
							</div>
						);
					}

					return null;
				})}
			</div>
		</div>
	);
};

export default VideoEmbed;
