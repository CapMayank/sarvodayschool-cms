/** @format */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createDynamicMetadata } from "@/lib/seo";

// ISR: Re-check for new content every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = createDynamicMetadata(
	"All News & Updates",
	"Stay informed with all the latest news, events, announcements, and achievements from Sarvodaya School Lakhnadon. Browse through our complete news archive.",
	"/news",
	{
		keywords: [
			"school news",
			"school updates",
			"school events",
			"school announcements",
			"education news Lakhnadon",
			"Sarvodaya School news",
			"school achievements",
			"school activities",
		],
	}
);

interface NewsItem {
	id: number;
	slug: string;
	title: string;
	excerpt: string;
	imageUrl?: string;
	category: string;
	publishDate: string;
}

async function getAllNews(): Promise<NewsItem[]> {
	try {
		const news = await prisma.news.findMany({
			where: {
				isPublished: true,
			},
			orderBy: {
				publishDate: "desc",
			},
			select: {
				id: true,
				slug: true,
				title: true,
				excerpt: true,
				imageUrl: true,
				category: true,
				publishDate: true,
			},
		});

		return news.map((item) => ({
			...item,
			imageUrl: item.imageUrl || undefined,
			publishDate: item.publishDate.toISOString(),
		}));
	} catch (error) {
		console.error("Error fetching all news:", error);
		return [];
	}
}

async function getCategories(): Promise<string[]> {
	try {
		const categories = await prisma.news.findMany({
			where: {
				isPublished: true,
			},
			select: {
				category: true,
			},
			distinct: ["category"],
		});

		return categories.map((c) => c.category).sort();
	} catch (error) {
		console.error("Error fetching categories:", error);
		return [];
	}
}

export default async function AllNewsPage() {
	const allNews = await getAllNews();
	const categories = await getCategories();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "General":
				return "bg-blue-100 text-blue-800 hover:bg-blue-200";
			case "Announcement":
				return "bg-purple-100 text-purple-800 hover:bg-purple-200";
			case "Event":
				return "bg-green-100 text-green-800 hover:bg-green-200";
			case "Achievement":
				return "bg-orange-100 text-orange-800 hover:bg-orange-200";
			default:
				return "bg-gray-100 text-gray-800 hover:bg-gray-200";
		}
	};

	return (
		<>
			<Header title="All News & Updates" />
			<div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					{/* Page Header */}
					<div className="text-center mb-12">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
							News & <span className="text-red-600">Updates</span>
						</h1>
						<div className="w-24 h-1 bg-linear-to-r from-red-600 to-red-500 mx-auto rounded-full mb-6" />
						<p className="text-gray-600 text-lg max-w-2xl mx-auto">
							Stay updated with all the latest happenings, events, and
							announcements from our school
						</p>
					</div>

					{/* Category Filter - Client Side */}
					<div className="mb-8">
						<div
							className="flex flex-wrap justify-center gap-3"
							id="category-filters"
						>
							<button
								data-category="all"
								className="category-filter px-6 py-2 rounded-full font-medium transition-all duration-300 bg-red-600 text-white shadow-lg"
							>
								All
							</button>
							{categories.map((category) => (
								<button
									key={category}
									data-category={category}
									className="category-filter px-6 py-2 rounded-full font-medium transition-all duration-300 bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg"
								>
									{category}
								</button>
							))}
						</div>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
						<div className="bg-white rounded-xl p-6 shadow-md text-center">
							<div className="text-3xl font-bold text-red-600 mb-2">
								{allNews.length}
							</div>
							<div className="text-gray-600 text-sm">Total News</div>
						</div>
						{categories.slice(0, 3).map((category) => (
							<div
								key={category}
								className="bg-white rounded-xl p-6 shadow-md text-center"
							>
								<div className="text-3xl font-bold text-red-600 mb-2">
									{allNews.filter((news) => news.category === category).length}
								</div>
								<div className="text-gray-600 text-sm">{category}</div>
							</div>
						))}
					</div>

					{/* News Grid */}
					{allNews.length === 0 ? (
						<div className="text-center py-20">
							<BiCategory className="mx-auto text-gray-400 text-6xl mb-4" />
							<p className="text-gray-600 text-xl">
								No news available at the moment
							</p>
						</div>
					) : (
						<div
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
							id="news-grid"
						>
							{allNews.map((newsItem) => (
								<div
									key={newsItem.id}
									className="news-card"
									data-category={newsItem.category}
								>
									<Link href={`/news/${newsItem.slug}`} className="group block">
										<div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
											{/* Image */}
											<div className="relative h-64 overflow-hidden bg-gray-200">
												{newsItem.imageUrl ? (
													<Image
														src={newsItem.imageUrl}
														alt={newsItem.title}
														fill
														className="object-cover transform group-hover:scale-110 transition-transform duration-500"
														sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-red-100 to-red-200">
														<BiCategory className="text-red-400 text-6xl" />
													</div>
												)}
												{/* Category Badge */}
												<div className="absolute top-4 left-4">
													<span
														className={`px-4 py-1.5 ${getCategoryColor(
															newsItem.category
														)} text-sm font-semibold rounded-full shadow-lg transition-colors duration-300`}
													>
														{newsItem.category}
													</span>
												</div>
											</div>

											{/* Content */}
											<div className="p-6 grow flex flex-col">
												{/* Date */}
												<div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
													<FaCalendarAlt className="text-red-600" />
													<span>{formatDate(newsItem.publishDate)}</span>
												</div>
												{/* Title */}
												<h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
													{newsItem.title}
												</h3>
												{/* Excerpt */}
												<p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 grow">
													{newsItem.excerpt}
												</p>{" "}
												{/* Read More Link */}
												<div className="flex items-center text-red-600 font-semibold group-hover:gap-2 transition-all duration-300">
													<span>Read More</span>
													<FaArrowRight className="transform group-hover:translate-x-2 transition-transform duration-300" />
												</div>
											</div>
										</div>
									</Link>
								</div>
							))}
						</div>
					)}
				</div>

				<Footer />
			</div>

			{/* Client-side filtering script */}
			<script
				dangerouslySetInnerHTML={{
					__html: `
						(function() {
							document.addEventListener('DOMContentLoaded', function() {
								const filterButtons = document.querySelectorAll('.category-filter');
								const newsCards = document.querySelectorAll('.news-card');
								
								filterButtons.forEach(button => {
									button.addEventListener('click', function() {
										const category = this.getAttribute('data-category');
										
										// Update active button
										filterButtons.forEach(btn => {
											btn.classList.remove('bg-red-600', 'text-white', 'shadow-lg');
											btn.classList.add('bg-white', 'text-gray-700');
										});
										this.classList.remove('bg-white', 'text-gray-700');
										this.classList.add('bg-red-600', 'text-white', 'shadow-lg');
										
										// Filter news cards
										newsCards.forEach(card => {
											if (category === 'all' || card.getAttribute('data-category') === category) {
												card.style.display = 'block';
												card.style.animation = 'fadeIn 0.5s ease-in';
											} else {
												card.style.display = 'none';
											}
										});
									});
								});
							});
						})();
					`,
				}}
			/>
		</>
	);
}
