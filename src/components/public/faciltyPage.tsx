/** @format */
"use client";
import Image from "next/image";
import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import ClientModal from "@/components/ClientModal";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { Camera, Award, BookOpen, Info } from "lucide-react";

interface Facility {
	title: string;
	imageUrl: string;
	description: string;
	highlights?: { title: string; value: string }[];
	facilityFeatures?: { title: string; value: string }[];
	mediaGallery?: { type: string; src: string; caption?: string }[];
}

export default function FacilityPage({ facility }: { facility: Facility }) {
	if (!facility) {
		notFound();
	}

	return (
		<>
			<Header title={facility.title} />

			<div className="min-h-screen bg-linear-to-b from-white to-gray-50 py-12">
				<div className="max-w-7xl mx-auto px-4">
					{/* Main Content Container */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="bg-white rounded-2xl shadow-xl overflow-hidden"
					>
						{/* Hero Section */}
						<div className="relative h-[400px] md:h-[800px]">
							<Image
								src={facility.imageUrl}
								alt={facility.title}
								fill
								className="object-cover"
								priority
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
							<div className="absolute bottom-0 left-0 right-0 p-8 text-white">
								<motion.h1
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.2 }}
									className="text-4xl md:text-5xl font-bold mb-4"
								>
									{facility.title}
								</motion.h1>
								<motion.p
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.3 }}
									className="text-lg md:text-xl text-white/90 max-w-3xl"
								>
									{facility.description}
								</motion.p>
							</div>
						</div>

						{/* Content Sections */}
						<div className="p-8">
							{/* Highlights Section */}
							{facility.highlights && facility.highlights.length > 0 && (
								<motion.section
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.4 }}
									className="mb-16"
								>
									<div className="flex items-center gap-2 mb-8">
										<Award className="text-red-600 w-8 h-8" />
										<h2 className="text-2xl font-bold text-gray-900">
											Key Highlights
										</h2>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										{facility.highlights.map((highlight, index) => (
											<motion.div
												key={index}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.5, delay: 0.1 * index }}
												className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
											>
												<h3 className="text-xl font-semibold text-red-600 mb-2">
													{highlight.title}
												</h3>
												<p className="text-gray-700">{highlight.value}</p>
											</motion.div>
										))}
									</div>
								</motion.section>
							)}

							{/* Features Section */}
							{facility.facilityFeatures &&
								facility.facilityFeatures.length > 0 && (
									<motion.section
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 0.6 }}
										className="mb-16"
									>
										<div className="flex items-center gap-2 mb-8">
											<BookOpen className="text-red-600 w-8 h-8" />
											<h2 className="text-2xl font-bold text-gray-900">
												Features & Amenities
											</h2>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{facility.facilityFeatures.map((feature, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.5, delay: 0.1 * index }}
													className="bg-linear-to-br from-red-50 to-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
												>
													<h3 className="text-xl font-semibold text-red-600 mb-2">
														{feature.title}
													</h3>
													<p className="text-gray-700">{feature.value}</p>
												</motion.div>
											))}
										</div>
									</motion.section>
								)}

							{/* Gallery Section */}
							{facility.mediaGallery && facility.mediaGallery.length > 0 && (
								<motion.section
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.8 }}
								>
									<div className="flex items-center gap-2 mb-8">
										<Camera className="text-red-600 w-8 h-8" />
										<h2 className="text-2xl font-bold text-gray-900">
											Gallery
										</h2>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
										{facility.mediaGallery.map((media, index) => (
											<motion.div
												key={index}
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ duration: 0.5, delay: 0.1 * index }}
												className="group relative overflow-hidden rounded-xl bg-white shadow-lg"
											>
												{media.type === "image" ? (
													<ClientModal
														imageUrl={media.src}
														altText={media.caption || "Gallery image"}
													>
														<div className="relative h-[220px] overflow-hidden rounded-lg">
															<Image
																src={media.src}
																alt={media.caption || "Gallery image"}
																fill
																className="object-cover transition-transform duration-300 group-hover:scale-110"
															/>
															<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
														</div>
													</ClientModal>
												) : (
													<iframe
														className="w-full h-[220px] rounded-lg"
														src={`https://www.youtube.com/embed/${media.src}`}
														title={media.caption || "YouTube video"}
														allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
														allowFullScreen
													/>
												)}
												{media.caption && (
													<p className="p-4 text-sm text-gray-600">
														{media.caption}
													</p>
												)}
											</motion.div>
										))}
									</div>
								</motion.section>
							)}

							{/* CTA Section */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 1 }}
								className="mt-16 text-center"
							>
								<a
									href="/contact"
									className="inline-flex items-center px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
								>
									<Info className="w-5 h-5 mr-2" />
									<span className="font-semibold">
										Contact Us for More Information
									</span>
								</a>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</div>

			<Footer />
		</>
	);
}
