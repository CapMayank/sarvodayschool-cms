/** @format */

"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Award, Sparkles } from "lucide-react";

interface Achievement {
	id: number;
	title: string;
	description: string;
	imageUrl: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export default function AchievementsSection() {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch achievements from API
	useEffect(() => {
		const fetchAchievements = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/achievements");

				if (!response.ok) {
					throw new Error("Failed to fetch achievements");
				}

				const data = await response.json();

				// Sort by order field
				const sortedAchievements = data.sort(
					(a: Achievement, b: Achievement) => a.order - b.order
				);

				setAchievements(sortedAchievements);
				setError(null);
			} catch (err) {
				console.error("Error fetching achievements:", err);
				setError("Failed to load achievements");
			} finally {
				setLoading(false);
			}
		};

		fetchAchievements();
	}, []);

	const scrollLeft = useCallback(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
		}
	}, []);

	const scrollRight = useCallback(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
		}
	}, []);

	// Loading state
	if (loading) {
		return (
			<div className="relative w-full bg-linear-to-b from-white to-gray-50 py-20">
				<div className="max-w-7xl mx-auto px-4">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<div className="inline-flex items-center gap-3 mb-4">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
							>
								<Award className="text-red-600 w-10 h-10" />
							</motion.div>
							<h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
								Our <span className="text-red-600">Achievements</span>
							</h2>
						</div>
					</motion.div>
					<div className="flex justify-center">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
						>
							<div className="rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600"></div>
						</motion.div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="relative w-full bg-linear-to-b from-white to-gray-50 py-20">
				<div className="max-w-7xl mx-auto px-4">
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<div className="inline-flex items-center gap-3 mb-4">
							<Award className="text-red-600 w-10 h-10" />
							<h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
								Our <span className="text-red-600">Achievements</span>
							</h2>
						</div>
					</motion.div>
					<motion.div
						className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md mx-auto text-center"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<p className="text-red-700 text-lg font-medium mb-4">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md hover:shadow-lg"
						>
							Retry
						</button>
					</motion.div>
				</div>
			</div>
		);
	}

	// No achievements available
	if (achievements.length === 0) {
		return (
			<div className="relative w-full bg-linear-to-b from-white to-gray-50 py-20">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<div className="inline-flex items-center gap-3 mb-4">
						<Award className="text-red-600 w-10 h-10" />
						<h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
							Our <span className="text-red-600">Achievements</span>
						</h2>
					</div>
					<p className="text-gray-500 text-lg mt-6">
						No achievements available at the moment
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative w-full bg-linear-to-b from-white to-gray-50 py-20 ">
			<div className="max-w-7xl mx-auto px-4">
				{/* Header */}
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="inline-flex items-center gap-3 mb-6">
						<motion.div
							animate={{ scale: [1, 1.1, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<Award className="text-red-600 w-10 h-10" />
						</motion.div>
						<h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
							Our <span className="text-red-600">Achievements</span>
						</h2>
					</div>
					<p className="text-gray-600 max-w-2xl mx-auto text-lg">
						Celebrating excellence and recognition in academics, sports, and
						co-curricular activities
					</p>
				</motion.div>

				{/* Carousel Container */}
				<div className="relative group">
					{/* Scroll Buttons */}
					<motion.button
						className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-50 bg-linear-to-br from-red-600 to-red-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all opacity-0 group-hover:opacity-100"
						onClick={scrollLeft}
						aria-label="Scroll left"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						<ChevronLeft size={24} />
					</motion.button>

					<motion.button
						className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-50 bg-linear-to-br from-red-600 to-red-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all opacity-0 group-hover:opacity-100"
						onClick={scrollRight}
						aria-label="Scroll right"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						<ChevronRight size={24} />
					</motion.button>

					{/* Scrolling Achievements List */}
					<div
						ref={scrollRef}
						className="w-full flex space-x-6 px-8 py-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x relative z-10"
					>
						{achievements.map((achievement, index) => (
							<motion.div
								key={achievement.id}
								className="relative min-w-[300px] md:min-w-[400px] rounded-2xl overflow-hidden cursor-pointer group/card"
								initial={{ opacity: 0, x: 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: index * 0.2 }}
								viewport={{ once: true }}
								whileHover={{ y: -8 }}
							>
								{/* Card Background */}
								<div className="absolute inset-0 bg-linear-to-br from-red-600/0 to-red-600/0 group-hover/card:from-red-600/10 group-hover/card:to-red-600/20 transition-all duration-500 z-20 pointer-events-none" />

								{/* Achievement Image */}
								<img
									src={achievement.imageUrl}
									alt={achievement.title}
									className="w-full h-[350px] object-cover transition-transform duration-500 group-hover/card:scale-110"
								/>

								{/* Overlay */}
								<div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20" />

								{/* Content Box */}
								<div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-gray-950 via-gray-950/80 to-transparent text-white p-6 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300 z-30">
									<motion.div
										initial={{ opacity: 0 }}
										whileInView={{ opacity: 1 }}
										transition={{ delay: 0.2 }}
									>
										<div className="flex items-start gap-2 mb-2">
											<Sparkles className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
											<h3 className="text-xl font-bold leading-tight">
												{achievement.title}
											</h3>
										</div>
										<p className="text-sm text-gray-200 line-clamp-2">
											{achievement.description}
										</p>
									</motion.div>
								</div>

								{/* Border Glow */}
								<div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-hover/card:border-red-600/50 transition-colors duration-300 z-20" />

								{/* Card Shadow */}
								<div className="absolute -inset-0.5 bg-linear-to-r from-red-600/0 to-red-600/0 group-hover/card:from-red-600/20 group-hover/card:to-red-600/20 rounded-2xl blur-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 -z-10" />
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
