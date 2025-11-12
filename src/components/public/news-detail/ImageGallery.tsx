/** @format */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BsChevronLeft, BsChevronRight, BsX } from "react-icons/bs";

interface ImageGalleryProps {
	images: string[];
	title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
	const [selectedImage, setSelectedImage] = useState<number | null>(null);

	if (!images || images.length === 0) return null;

	const nextImage = () => {
		if (selectedImage !== null) {
			setSelectedImage((selectedImage + 1) % images.length);
		}
	};

	const prevImage = () => {
		if (selectedImage !== null) {
			setSelectedImage(
				selectedImage === 0 ? images.length - 1 : selectedImage - 1
			);
		}
	};

	return (
		<div className="my-8">
			<h3 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h3>

			{/* Grid of images */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{images.map((image, index) => (
					<motion.div
						key={index}
						whileHover={{ scale: 1.05 }}
						className="relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
						onClick={() => setSelectedImage(index)}
					>
						<Image
							src={image}
							alt={`${title} - Image ${index + 1}`}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
						/>
					</motion.div>
				))}
			</div>

			{/* Lightbox Modal */}
			<AnimatePresence>
				{selectedImage !== null && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
						onClick={() => setSelectedImage(null)}
					>
						{/* Close button */}
						<button
							className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
							onClick={() => setSelectedImage(null)}
						>
							<BsX className="w-10 h-10" />
						</button>

						{/* Previous button */}
						{images.length > 1 && (
							<button
								className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
								onClick={(e) => {
									e.stopPropagation();
									prevImage();
								}}
							>
								<BsChevronLeft className="w-10 h-10" />
							</button>
						)}

						{/* Image */}
						<motion.div
							key={selectedImage}
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.8 }}
							className="relative max-w-5xl max-h-[80vh] w-full h-full"
							onClick={(e) => e.stopPropagation()}
						>
							<Image
								src={images[selectedImage]}
								alt={`${title} - Image ${selectedImage + 1}`}
								fill
								className="object-contain"
								sizes="100vw"
							/>
						</motion.div>

						{/* Next button */}
						{images.length > 1 && (
							<button
								className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
								onClick={(e) => {
									e.stopPropagation();
									nextImage();
								}}
							>
								<BsChevronRight className="w-10 h-10" />
							</button>
						)}

						{/* Image counter */}
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
							{selectedImage + 1} / {images.length}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default ImageGallery;
