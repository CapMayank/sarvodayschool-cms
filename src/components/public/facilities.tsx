/** @format */

"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import facilities from "@/lib/facilities/facilities";

export default function FacilitiesSection() {
	const scrollRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollLeftStart, setScrollLeftStart] = useState(0);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		setIsDragging(true);
		setStartX(e.pageX);
		if (scrollRef.current) {
			setScrollLeftStart(scrollRef.current.scrollLeft);
		}
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isDragging) return;
		const deltaX = e.pageX - startX;
		if (scrollRef.current) {
			scrollRef.current.scrollLeft = scrollLeftStart - deltaX;
		}
	};

	const handleMouseUp = () => setIsDragging(false);

	const scrollLeft = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
		}
	};

	const scrollRight = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
		}
	};

	const openFacilityPage = (id: string) => {
		router.push(`/facilities/${id}`);
	};

	return (
		<div className="relative w-full bg-linear-to-b from-white to-gray-50 py-24 px-6 sm:px-6 lg:px-8 overflow-hidden">
			{/* Header */}
			<motion.div
				className="text-center mb-16"
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
					Our School <span className="text-red-600">Facilities</span>
				</h2>
				<div className="w-24 h-1 bg-linear-to-r from-red-600 to-red-500 mx-auto rounded-full" />
			</motion.div>

			{/* Scroll Buttons */}
			<button
				className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 text-red-600 p-3 rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-all duration-300 backdrop-blur-sm z-50"
				onClick={scrollLeft}
				aria-label="Scroll left"
			>
				<ChevronLeft size={24} />
			</button>

			<button
				className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 text-red-600 p-3 rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-all duration-300 backdrop-blur-sm z-50"
				onClick={scrollRight}
				aria-label="Scroll right"
			>
				<ChevronRight size={24} />
			</button>

			{/* Scrolling Facilities List */}
			<div
				ref={scrollRef}
				className="w-full flex space-x-6 px-8 py-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x relative z-10"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			>
				{facilities.map((facility, index) => (
					<motion.div
						key={facility.id}
						className="group relative min-w-[300px] md:min-w-[400px] bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 snap-center"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						viewport={{ once: true }}
						onClick={() => openFacilityPage(facility.id)}
					>
						{/* Image Container */}
						<div className="relative h-72 overflow-hidden">
							<Image
								src={facility.imageUrl}
								alt={facility.title}
								width={400}
								height={250}
								className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
							{/* Overlay */}
							<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						</div>

						{/* Content */}
						<div className="p-6">
							<h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
								{facility.title}
							</h3>
							<p className="mt-2 text-gray-600 line-clamp-2">
								{facility.description}
							</p>

							{/* Highlights Preview */}
							<div className="mt-4 flex flex-wrap gap-2">
								{facility.highlights?.slice(0, 2).map((highlight, idx) => (
									<span
										key={idx}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-600 border border-red-100"
									>
										{highlight.value}
									</span>
								))}
							</div>

							{/* View More Button */}
							<div className="mt-4 flex items-center text-red-600 font-medium">
								<span className="mr-2">Learn More</span>
								<ChevronRight
									size={16}
									className="transition-transform group-hover:translate-x-2"
								/>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}
