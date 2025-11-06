/** @format */

"use client";
import React, { useState, useEffect, useCallback } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { motion } from "framer-motion";
import Modal from "@/components/public/Modal"; // (updated version below)
import Image from "next/image";

interface Slide {
	id: number;
	title?: string;
	imageUrl: string;
	isActive: boolean;
	order: number;
}

const Slideshow = () => {
	const [slides, setSlides] = useState<Slide[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSlideshows = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/slideshows");

				if (!response.ok) throw new Error("Failed to fetch slideshows");

				const data = await response.json();
				const activeSlides = data
					.filter((slide: Slide) => slide.isActive)
					.sort((a: Slide, b: Slide) => a.order - b.order);

				setSlides(activeSlides);
			} catch (err) {
				console.error("Error fetching slideshows:", err);
				setError("Failed to load slideshows");
			} finally {
				setLoading(false);
			}
		};

		fetchSlideshows();
	}, []);

	const nextSlide = useCallback(() => {
		setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
	}, [slides.length]);

	useEffect(() => {
		if (slides.length === 0) return;
		const interval = setInterval(nextSlide, 6000);
		return () => clearInterval(interval);
	}, [currentIndex, nextSlide, slides.length]);

	const prevSlide = useCallback(() => {
		setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
	}, [slides.length]);

	const goToSlide = (slideIndex: number) => setCurrentIndex(slideIndex);

	const openModal = (imageUrl: string) => {
		setSelectedImage(imageUrl);
		setShowModal(true);
	};

	/* ✅ Loading State */
	if (loading) {
		return (
			<div className="relative w-full h-[480px] md:h-[680px] flex items-center justify-center">
				<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
			</div>
		);
	}

	/* ✅ Error State */
	if (error) {
		return (
			<div className="relative w-full h-[480px] md:h-[680px] flex items-center justify-center">
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
		);
	}

	/* ✅ No Slides */
	if (slides.length === 0) {
		return (
			<div className="relative w-full h-[480px] md:h-[680px] flex items-center justify-center">
				<p className="text-gray-600 text-xl">No slides available</p>
			</div>
		);
	}

	/* ✅ MAIN SLIDESHOW */
	return (
		<section className="relative w-full bg-linear-to-b from-white to-gray-50 py-20 overflow-visible">
			<motion.div
				className="text-center mb-16"
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
					Our School <span className="text-red-600">Results</span>
				</h2>
				<div className="w-24 h-1 bg-linear-to-r from-red-600 to-red-500 mx-auto rounded-full" />
			</motion.div>
			<div className="relative w-full max-w-7xl mx-auto h-[480px] md:h-[650px] rounded-xl overflow-hidden shadow-xl">
				{/* Background Blur */}
				<motion.div
					key={currentIndex}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8 }}
					style={{ backgroundImage: `url(${slides[currentIndex].imageUrl})` }}
					className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-30"
				/>

				{/* Main Clean Image (no cropping, no stretch) */}
				<motion.div
					key={slides[currentIndex].imageUrl}
					initial={{ opacity: 0, scale: 1.02 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.7 }}
					className="relative w-full h-full flex items-center justify-center cursor-pointer z-10"
					onClick={() => openModal(slides[currentIndex].imageUrl)}
				>
					<div className="relative w-full h-full">
						<Image
							src={slides[currentIndex].imageUrl}
							alt="Slide"
							fill
							sizes="100vw"
							className="object-contain drop-shadow-xl"
							onClick={() => openModal(slides[currentIndex].imageUrl)}
							loading="eager"
						/>
					</div>
				</motion.div>

				{/* Navigation Arrows */}
				<button
					onClick={prevSlide}
					className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 md:p-3 backdrop-blur-md shadow-md z-20 transition"
				>
					<BsChevronCompactLeft className="w-6 h-6" />
				</button>

				<button
					onClick={nextSlide}
					className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 md:p-3 backdrop-blur-md shadow-md z-20 transition"
				>
					<BsChevronCompactRight className="w-6 h-6" />
				</button>

				{/* Navigation Dots */}
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
					{slides.map((_, index) => (
						<button
							key={index}
							onClick={() => goToSlide(index)}
							className={`transition-all duration-300 rounded-full ${
								currentIndex === index
									? "w-6 h-2 bg-red-500 shadow"
									: "w-2 h-2 bg-white/60 hover:bg-white"
							}`}
						/>
					))}
				</div>
			</div>

			{/* Modal */}
			{showModal && selectedImage && (
				<Modal
					showModal={showModal}
					setShowModal={setShowModal}
					imageUrl={selectedImage}
				/>
			)}
		</section>
	);
};

export default Slideshow;
