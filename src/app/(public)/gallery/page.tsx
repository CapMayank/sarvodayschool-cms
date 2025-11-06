/** @format */

"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Video, ChevronRight, AlertCircle } from "lucide-react";
import { CategoryGridSkeleton } from "@/components/LoadingSkeleton";

interface GalleryCategory {
	id: number;
	name: string;
	title: string;
	description: string;
	order: number;
}

interface PlaylistVideo {
	id: number;
	youtubeId: string;
	title: string;
	order: number;
}

interface Thumbnail {
	[key: string]: string;
}

const Gallery = () => {
	const [categories, setCategories] = useState<GalleryCategory[]>([]);
	const [playlists, setPlaylists] = useState<PlaylistVideo[]>([]);
	const [thumbnails, setThumbnails] = useState<Thumbnail>({});
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [loadingPlaylists, setLoadingPlaylists] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch categories from database
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await fetch("/api/gallery/categories");
				if (!res.ok) throw new Error("Failed to fetch categories");
				const data = await res.json();
				setCategories(data.categories || []);
			} catch (err) {
				setError("Failed to load gallery categories");
			} finally {
				setLoadingCategories(false);
			}
		};

		fetchCategories();
	}, []);

	// Fetch playlists from database
	useEffect(() => {
		const fetchPlaylists = async () => {
			try {
				const res = await fetch("/api/gallery/playlists");
				if (!res.ok) throw new Error("Failed to fetch playlists");
				const data = await res.json();
				setPlaylists(data.playlists || []);
			} catch (err) {
				setError("Failed to load video playlists");
			} finally {
				setLoadingPlaylists(false);
			}
		};

		fetchPlaylists();
	}, []);

	// Fetch thumbnails in background
	useEffect(() => {
		const fetchThumbnails = async () => {
			try {
				const res = await fetch("/api/gallery/thumbnails");
				if (res.ok) {
					const data = await res.json();
					setThumbnails(data.thumbnails || {});
				}
			} catch (err) {
				console.error("Error fetching thumbnails:", err);
			}
		};

		if (categories.length > 0) {
			fetchThumbnails();
		}
	}, [categories]);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
			},
		},
	};

	return (
		<>
			<Header title="Gallery" />

			<div className="max-w-7xl mx-auto px-4 py-12 md:pt-30 bg-gray-100 md:bg-transparent mt-5">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-16"
				>
					<h1 className="text-4xl md:text-4xl font-bold text-gray-800 mb-4">
						Our School Gallery
					</h1>
					<p className="text-gray-600 max-w-2xl mx-auto">
						Explore our vibrant collection of memories, achievements, and
						celebrations
					</p>
				</motion.div>

				{/* Error Message */}
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
					>
						<AlertCircle className="w-5 h-5 text-red-600" />
						<p className="text-red-700">{error}</p>
					</motion.div>
				)}

				{/* Photo Collections Section */}
				<section className="mb-20">
					<div className="flex items-center mb-8">
						<Camera className="w-6 h-6 text-red-600 mr-2" />
						<h2 className="text-2xl font-bold text-gray-800">
							Photo Collections
						</h2>
					</div>

					{loadingCategories ? (
						<CategoryGridSkeleton />
					) : categories.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
							<p>No photo collections available yet.</p>
						</div>
					) : (
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
						>
							{categories.map((category) => (
								<div key={`category-${category.id}`}>
									<motion.div
										variants={itemVariants}
										className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-64"
									>
										<Link href={`/gallery/${category.name}`}>
											{/* Background Image Container */}
											<div className="relative w-full h-full">
												{/* Image */}
												{thumbnails[category.name] ? (
													<CldImage
														src={thumbnails[category.name]}
														alt={category.title}
														fill
														priority={false}
														sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
														className="object-cover group-hover:scale-110 transition-transform duration-500"
													/>
												) : (
													<div className="w-full h-full bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center">
														<Camera className="w-16 h-16 text-red-600 opacity-50" />
													</div>
												)}

												{/* Dark Overlay */}
												<div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-transparent" />

												{/* Text Overlay */}
												<div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
													<h3 className="text-lg font-bold mb-1 line-clamp-2">
														{category.title}
													</h3>
													<p className="text-xs sm:text-sm text-gray-100 line-clamp-2">
														{category.description}
													</p>
												</div>

												{/* Hover Icon */}
												<div className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
													<ChevronRight className="w-4 h-4" />
												</div>
											</div>
										</Link>
									</motion.div>
								</div>
							))}
						</motion.div>
					)}
				</section>

				{/* Video Highlights Section */}
				<section>
					<div className="flex items-center mb-8">
						<Video className="w-6 h-6 text-red-600 mr-2" />
						<h2 className="text-2xl font-bold text-gray-800">
							Video Highlights
						</h2>
					</div>

					{loadingPlaylists ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{[...Array(4)].map((_, i) => (
								<div
									key={`skeleton-${i}`}
									className="bg-gray-200 rounded-xl h-48 animate-pulse"
								/>
							))}
						</div>
					) : playlists.length === 0 ? (
						<div className="text-center py-12 text-gray-500">
							<Video className="w-16 h-16 mx-auto mb-4 opacity-30" />
							<p>No video playlists available yet.</p>
						</div>
					) : (
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
						>
							{playlists.map((playlist) => (
								<div key={`playlist-${playlist.id}`}>
									<motion.div
										variants={itemVariants}
										className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
									>
										<div className="aspect-video bg-black">
											<iframe
												src={`https://www.youtube.com/embed/videoseries?list=${playlist.youtubeId}`}
												title={playlist.title}
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowFullScreen
												className="w-full h-full"
											></iframe>
										</div>
										<div className="p-4">
											<h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
												{playlist.title}
											</h3>
										</div>
									</motion.div>
								</div>
							))}
						</motion.div>
					)}
				</section>
			</div>

			<Footer />
		</>
	);
};

export default Gallery;
