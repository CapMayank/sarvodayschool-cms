/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import Link from "next/link";
import Image from "next/image";

interface NewsItem {
	id: number;
	slug: string;
	title: string;
	excerpt: string;
	imageUrl?: string;
	category: string;
	publishDate: string;
	createdAt: string;
	updatedAt: string;
}

const News = () => {
	const [news, setNews] = useState<NewsItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>("All");

	// Fetch news from API
	useEffect(() => {
		const fetchNews = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/news?limit=10");

				if (!response.ok) {
					throw new Error("Failed to fetch news");
				}

				const data = await response.json();

				// Sort by publishDate (newest first)
				const sortedNews = data.sort(
					(a: NewsItem, b: NewsItem) =>
						new Date(b.publishDate).getTime() -
						new Date(a.publishDate).getTime()
				);

				setNews(sortedNews);
				setError(null);
			} catch (err) {
				console.error("Error fetching news:", err);
				setError("Failed to load news");
			} finally {
				setLoading(false);
			}
		};

		fetchNews();
	}, []);

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Get unique categories
	const categories = [
		"All",
		...Array.from(new Set(news.map((item) => item.category))),
	];

	// Filter news by category
	const filteredNews =
		selectedCategory === "All"
			? news
			: news.filter((item) => item.category === selectedCategory);

	// Loading state
	if (loading) {
		return (
			<div className="py-16 bg-linear-to-b from-gray-50 to-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							Latest <span className="text-red-600">News</span>
						</h2>
						<div className="w-24 h-1 bg-linear-to-r from-red-600 to-red-500 mx-auto rounded-full mb-4" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="animate-pulse">
								<div className="bg-gray-200 h-64 rounded-t-xl" />
								<div className="bg-white p-6 rounded-b-xl shadow-lg">
									<div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
									<div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
									<div className="h-3 bg-gray-200 rounded w-full mb-2" />
									<div className="h-3 bg-gray-200 rounded w-5/6" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="py-16 bg-linear-to-b from-gray-50 to-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							Latest <span className="text-red-600">News</span>
						</h2>
						<div className="w-24 h-1 bg-linear-to-r from-red-600 to-red-500 mx-auto rounded-full" />
					</div>
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<p className="text-red-600 text-xl mb-4">{error}</p>
							<button
								onClick={() => window.location.reload()}
								className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
							>
								Retry
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// No news available
	if (news.length === 0) {
		return (
			<div className="py-16 bg-linear-to-b from-gray-50 to-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							Latest <span className="text-red-600">News</span>
						</h2>
						<div className="w-24 h-1 bg-linear-to-r from-red-600 to-red-500 mx-auto rounded-full" />
					</div>
					<div className="flex items-center justify-center min-h-[400px]">
						<p className="text-gray-600 text-xl">
							No news available at the moment
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-16 bg-linear-to-b from-gray-50 to-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Latest <span className="text-red-600">News</span>
					</h2>
					<div className="w-24 h-1 bg-linear-to-r from-red-600 to-red-500 mx-auto rounded-full mb-4" />
					<p className="text-gray-600 text-lg max-w-2xl mx-auto">
						Stay updated with the latest happenings, events, and announcements
						from our school
					</p>
				</motion.div>
				{/* Category Filter */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="flex flex-wrap justify-center gap-3 mb-12"
				>
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => setSelectedCategory(category)}
							className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
								selectedCategory === category
									? "bg-red-600 text-white shadow-lg scale-105"
									: "bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg"
							}`}
						>
							{category}
						</button>
					))}
				</motion.div>
				{/* News Layout */}
				{filteredNews.length > 0 && (
					<div className="space-y-8">
						{/* Featured Latest News */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							<Link
								href={`/news/${filteredNews[0].slug}`}
								className="group block"
							>
								<div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
									<div className="grid md:grid-cols-2 gap-0">
										{/* Featured Image */}
										<div className="relative h-[300px] md:h-[500px] overflow-hidden bg-gray-200">
											{filteredNews[0].imageUrl ? (
												<Image
													src={filteredNews[0].imageUrl}
													alt={filteredNews[0].title}
													fill
													className="object-cover transform group-hover:scale-105 transition-transform duration-700"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-red-100 to-red-200">
													<BiCategory className="text-red-400 text-8xl" />
												</div>
											)}
											{/* Latest Badge */}
											<div className="absolute top-6 left-6">
												<span className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
													<span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
													LATEST
												</span>
											</div>
											{/* Category Badge */}
											<div className="absolute bottom-6 left-6">
												<span className="px-4 py-1.5 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
													{filteredNews[0].category}
												</span>
											</div>
										</div>

										{/* Featured Content */}
										<div className="p-8 md:p-12 flex flex-col justify-center">
											{/* Date */}
											<div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
												<FaCalendarAlt className="text-red-600" />
												<span className="font-medium">
													{formatDate(filteredNews[0].publishDate)}
												</span>
											</div>

											{/* Title */}
											<h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors duration-300">
												{filteredNews[0].title}
											</h3>

											{/* Excerpt */}
											<p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 line-clamp-4">
												{filteredNews[0].excerpt}
											</p>

											{/* Read More Link */}
											<div className="flex items-center gap-2 text-red-600 font-bold text-lg">
												<span>Read Full Story</span>
												<FaArrowRight className="transform group-hover:translate-x-2 transition-transform duration-300" />
											</div>
										</div>
									</div>
								</div>
							</Link>
						</motion.div>

						{/* Older News - Compact List */}
						{filteredNews.length > 1 && (
							<div className="space-y-6">
								<div className="flex items-center gap-3 mb-6">
									<div className="h-px bg-gray-300 grow"></div>
									<h3 className="text-xl font-bold text-gray-700 uppercase tracking-wider">
										Previous Updates
									</h3>
									<div className="h-px bg-gray-300 grow"></div>
								</div>{" "}
								<div className="grid md:grid-cols-2 gap-6">
									{filteredNews.slice(1).map((newsItem, index) => (
										<motion.div
											key={newsItem.id}
											initial={{ opacity: 0, y: 20 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ duration: 0.4, delay: index * 0.05 }}
										>
											<Link
												href={`/news/${newsItem.slug}`}
												className="group block"
											>
												<div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex h-full">
													{/* Thumbnail */}
													<div className="relative w-32 md:w-40 shrink-0 overflow-hidden bg-gray-200">
														{newsItem.imageUrl ? (
															<Image
																src={newsItem.imageUrl}
																alt={newsItem.title}
																fill
																className="object-cover transform group-hover:scale-110 transition-transform duration-500"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
																<BiCategory className="text-gray-400 text-4xl" />
															</div>
														)}
													</div>

													{/* Content */}
													<div className="p-4 grow flex flex-col justify-between">
														{/* Date & Category */}
														<div>
															<div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
																<FaCalendarAlt className="text-red-500" />
																<span>{formatDate(newsItem.publishDate)}</span>
																<span className="text-gray-300">•</span>
																<span className="text-red-600 font-semibold">
																	{newsItem.category}
																</span>
															</div>

															{/* Title */}
															<h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
																{newsItem.title}
															</h4>

															{/* Excerpt */}
															<p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
																{newsItem.excerpt}
															</p>
														</div>

														{/* Read More Link */}
														<div className="flex items-center text-red-600 font-semibold text-sm group-hover:gap-1 transition-all duration-300">
															<span>Read More</span>
															<FaArrowRight className="text-xs transform group-hover:translate-x-1 transition-transform duration-300" />
														</div>
													</div>
												</div>
											</Link>
										</motion.div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* View All Button */}
				{news.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="text-center mt-12"
					>
						<Link
							href="/news"
							className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
						>
							View All News
							<FaArrowRight />
						</Link>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default News;
