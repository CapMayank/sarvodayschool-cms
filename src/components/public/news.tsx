/** @format */

"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";

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
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	const nextSlide = React.useCallback(() => {
		setCurrentIndex((prev) => (prev === news.length - 1 ? 0 : prev + 1));
	}, [news.length]);

	// Auto-play functionality
	useEffect(() => {
		if (news.length === 0) return;

		const timer = setInterval(nextSlide, 10000);
		return () => clearInterval(timer);
	}, [nextSlide, news.length]);

	const prevSlide = () => {
		setCurrentIndex((prev) => (prev === 0 ? news.length - 1 : prev - 1));
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Loading state
	if (loading) {
		return (
			<div className="py-16 bg-linear-to-b from-white to-gray-50">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold text-gray-900 mb-2">
							Latest <span className="text-red-600">News</span>
						</h2>
					</div>
					<div className="relative h-[600px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-100">
						<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="py-16 bg-linear-to-b from-white to-gray-50">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold text-gray-900 mb-2">
							Latest <span className="text-red-600">News</span>
						</h2>
					</div>
					<div className="relative h-[600px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-100">
						<div className="text-center">
							<p className="text-red-600 text-xl mb-2">{error}</p>
							<button
								onClick={() => window.location.reload()}
								className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
			<div className="py-16 bg-linear-to-b from-white to-gray-50">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="text-4xl font-bold text-gray-900 mb-2">
							Latest <span className="text-red-600">News</span>
						</h2>
					</div>
					<div className="relative h-[600px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-gray-100">
						<p className="text-gray-600 text-xl">No news available</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-16 bg-linear-to-b from-white to-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-12"
				>
					<h2 className="text-4xl font-bold text-gray-900 mb-2">
						Latest <span className="text-red-600">News</span>
					</h2>
					<div className="w-24 h-1 bg-linear-to-r from-red-600 to-red-500 mx-auto rounded-full" />
				</motion.div>

				{/* News Slider */}
				<div className="relative h-[600px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentIndex}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5 }}
							className="absolute inset-0"
						>
							{/* Background Image */}
							{news[currentIndex].imageUrl && (
								<div
									className="absolute inset-0 bg-cover bg-center"
									style={{
										backgroundImage: `url(${news[currentIndex].imageUrl})`,
									}}
								/>
							)}
							<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-transparent" />

							{/* Content */}
							<motion.div
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.2 }}
								className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-8 pt-16"
							>
								<div className="max-w-3xl mx-auto">
									<div className="flex items-center gap-2 text-red-500 mb-4">
										<FaCalendarAlt />
										<span className="text-white">
											{formatDate(news[currentIndex].publishDate)}
										</span>
										<span className="text-white mx-2">•</span>
										<span className="text-white">
											{news[currentIndex].category}
										</span>
									</div>
									<h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
										{news[currentIndex].title}
									</h3>
									<p className="text-white/90 text-base md:text-lg leading-relaxed line-clamp-3">
										{news[currentIndex].excerpt}
									</p>

									{/* Read More Button */}
									<Link
										href={`/news/${news[currentIndex].slug}`}
										className="inline-block mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
									>
										Read Full Article →
									</Link>
								</div>
							</motion.div>
						</motion.div>
					</AnimatePresence>

					{/* Navigation Buttons */}
					<div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
						<button
							onClick={prevSlide}
							className="p-2 rounded-full bg-black/20 backdrop-blur-lg hover:bg-black/40 transition-all duration-300 text-white pointer-events-auto"
							aria-label="Previous slide"
						>
							<BsChevronLeft size={24} />
						</button>
						<button
							onClick={nextSlide}
							className="p-2 rounded-full bg-black/20 backdrop-blur-lg hover:bg-black/40 transition-all duration-300 text-white pointer-events-auto"
							aria-label="Next slide"
						>
							<BsChevronRight size={24} />
						</button>
					</div>

					{/* Indicators */}
					<div className="absolute bottom-2 md:bottom-4 left-0 right-0 pointer-events-none">
						<div className="flex justify-center gap-2">
							{news.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentIndex(index)}
									className={`w-2 h-2 rounded-full transition-all duration-300 pointer-events-auto ${
										currentIndex === index
											? "w-8 bg-red-500"
											: "bg-white/50 hover:bg-white"
									}`}
									aria-label={`Go to slide ${index + 1}`}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default News;
