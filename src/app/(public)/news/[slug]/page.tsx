/** @format */

import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaTag } from "react-icons/fa";
import VideoEmbed from "@/components/public/news-detail/VideoEmbed";
import ImageGallery from "@/components/public/news-detail/ImageGallery";
import SocialLinks from "@/components/public/news-detail/SocialLinks";
import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import { Metadata } from "next";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to get base URL
function getBaseUrl() {
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL;
	}
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	return "http://localhost:3000";
}

interface NewsItem {
	id: number;
	slug: string;
	title: string;
	excerpt: string;
	detailedArticle: string;
	imageUrl?: string;
	images: string[];
	links?: Array<{
		type: string;
		url: string;
		title: string;
	}>;
	category: string;
	publishDate: string;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
}

async function getNewsItem(slug: string): Promise<NewsItem | null> {
	try {
		const baseUrl = getBaseUrl();

		const res = await fetch(`${baseUrl}/api/news/slug/${slug}`, {
			cache: "no-store",
			next: { revalidate: 0 },
		});

		if (!res.ok) {
			console.error(`Failed to fetch news: ${res.status} ${res.statusText}`);
			return null;
		}
		return res.json();
	} catch (error) {
		console.error("Error fetching news:", error);
		return null;
	}
}

async function getRelatedNews(
	category: string,
	currentId: number
): Promise<NewsItem[]> {
	try {
		const baseUrl = getBaseUrl();

		const res = await fetch(
			`${baseUrl}/api/news?category=${category}&limit=3`,
			{
				cache: "no-store",
				next: { revalidate: 0 },
			}
		);

		if (!res.ok) {
			console.error(
				`Failed to fetch related news: ${res.status} ${res.statusText}`
			);
			return [];
		}
		const allNews = await res.json();
		return allNews.filter((item: NewsItem) => item.id !== currentId);
	} catch (error) {
		console.error("Error fetching related news:", error);
		return [];
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const news = await getNewsItem(slug);

	if (!news) {
		return {
			title: "News Not Found",
		};
	}

	return {
		title: `${news.title} | School News`,
		description: news.excerpt,
		openGraph: {
			title: news.title,
			description: news.excerpt,
			images: news.imageUrl ? [news.imageUrl] : [],
			type: "article",
			publishedTime: news.publishDate,
		},
		twitter: {
			card: "summary_large_image",
			title: news.title,
			description: news.excerpt,
			images: news.imageUrl ? [news.imageUrl] : [],
		},
	};
}

export default async function NewsDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const news = await getNewsItem(slug);

	if (!news) {
		notFound();
	}

	const relatedNews = await getRelatedNews(news.category, news.id);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "General":
				return "bg-blue-100 text-blue-800";
			case "Announcement":
				return "bg-purple-100 text-purple-800";
			case "Event":
				return "bg-green-100 text-green-800";
			case "Achievement":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<>
			<Header title={news.title} />
			<div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
				{/* Header Component */}

				{/* Main Content */}
				<article className="max-w-5xl mx-auto px-4 py-8 md:py-12">
					{/* Article Metadata */}
					<header className="mb-8">
						{/* Category Badge & Date */}
						<div className="flex flex-wrap items-center gap-3 mb-6">
							<span
								className={`${getCategoryColor(
									news.category
								)} px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm`}
							>
								<FaTag className="w-3 h-3" />
								{news.category}
							</span>
							<span className="text-gray-600 text-sm flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
								<FaCalendarAlt className="w-4 h-4" />
								{formatDate(news.publishDate)}
							</span>
						</div>

						{/* Excerpt */}
						{news.excerpt && (
							<p className="text-lg md:text-xl text-gray-700 leading-relaxed border-l-4 border-red-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
								{news.excerpt}
							</p>
						)}
					</header>

					{/* Featured Image */}
					{news.imageUrl && (
						<div className="relative w-full h-[300px] md:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl mb-10 group">
							<Image
								src={news.imageUrl}
								alt={news.title}
								fill
								className="object-cover group-hover:scale-105 transition-transform duration-500"
								priority
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</div>
					)}

					{/* Article Content */}
					<div
						className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-600 prose-strong:text-gray-900 max-w-none mb-10 leading-relaxed"
						dangerouslySetInnerHTML={{ __html: news.detailedArticle }}
					/>

					{/* Video Embeds */}
					<VideoEmbed links={news.links} />

					{/* Image Gallery */}
					{news.images && news.images.length > 0 && (
						<ImageGallery images={news.images} title={news.title} />
					)}

					{/* Social Links */}
					<SocialLinks links={news.links} />

					{/* Related News */}
					{relatedNews.length > 0 && (
						<div className="mt-16 pt-10 border-t-2 border-gray-200">
							<div className="flex items-center gap-3 mb-8">
								<div className="w-1 h-8 bg-red-600 rounded-full" />
								<h3 className="text-2xl md:text-3xl font-bold text-gray-900">
									Related News
								</h3>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{relatedNews.map((item) => (
									<Link
										key={item.id}
										href={`/news/${item.slug}`}
										className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
									>
										{item.imageUrl && (
											<div className="relative w-full h-48 overflow-hidden">
												<Image
													src={item.imageUrl}
													alt={item.title}
													fill
													className="object-cover group-hover:scale-110 transition-transform duration-500"
													sizes="(max-width: 768px) 100vw, 33vw"
												/>
												<div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											</div>
										)}
										<div className="p-5">
											<span
												className={`${getCategoryColor(
													item.category
												)} px-3 py-1 rounded-full text-xs font-semibold inline-block mb-3`}
											>
												{item.category}
											</span>
											<h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-3 text-lg">
												{item.title}
											</h4>
											<p className="text-sm text-gray-600 line-clamp-2 mb-3">
												{item.excerpt}
											</p>
											<div className="flex items-center text-xs text-gray-500">
												<FaCalendarAlt className="w-3 h-3 mr-2" />
												{formatDate(item.publishDate)}
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}
				</article>

				<Footer />
			</div>
		</>
	);
}
