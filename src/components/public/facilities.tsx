/** @format */

"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { CldImage as Image } from "next-cloudinary";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Highlight {
	title: string;
	value: string;
}

interface Facility {
	id: number;
	slug: string;
	title: string;
	description: string;
	imageUrl: string;
	highlights: Highlight[];
	order: number;
	isActive: boolean;
}

export default function FacilitiesSection() {
	const scrollRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollLeftStart, setScrollLeftStart] = useState(0);
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadFacilities = async () => {
			try {
				const response = await fetch("/api/facilities?activeOnly=true");
				const data = await response.json();
				setFacilities(data.data);
			} catch (error) {
				console.error("Error loading facilities:", error);
			} finally {
				setLoading(false);
			}
		};

		loadFacilities();
	}, []);

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

	const openFacilityPage = (slug: string) => {
		router.push(`/facilities/${slug}`);
	};

	if (loading) {
		return (
			<div className="relative w-full bg-linear-to-b from-white to-gray-50 py-24 px-6 sm:px-6 lg:px-8 overflow-hidden">
				<div className="text-center mb-16">
					<Skeleton className="h-12 w-80 mx-auto mb-4" />
					<Skeleton className="w-24 h-1 mx-auto rounded-full" />
				</div>
				<div className="w-full flex space-x-6 px-8 py-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x relative z-10">
					{[1, 2, 3].map((i) => (
						<div key={i} className="min-w-[300px] md:min-w-[400px] bg-white rounded-xl shadow-lg overflow-hidden snap-center">
							<Skeleton className="h-72 w-full rounded-none" />
							<div className="p-6">
								<Skeleton className="h-8 w-3/4 mb-2" />
								<Skeleton className="h-4 w-full mb-1" />
								<Skeleton className="h-4 w-5/6 mb-4" />
								<div className="flex gap-2">
									<Skeleton className="h-6 w-24 rounded-full" />
									<Skeleton className="h-6 w-20 rounded-full" />
								</div>
								<Skeleton className="h-4 w-24 mt-6" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (facilities.length === 0) {
		return null;
	}

	return (
		<div className="relative w-full bg-linear-to-b from-white to-gray-50 py-24 px-6 sm:px-6 lg:px-8 overflow-hidden">
			{/* Header */}
			<motion.div
				className="text-center mb-16"
				initial={{ opacity: 0, y: -30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
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
					<FacilityCard 
						key={facility.id} 
						facility={facility} 
						index={index} 
						onClick={() => openFacilityPage(facility.slug)} 
					/>
				))}
			</div>
		</div>
	);
}

function FacilityCard({ facility, index, onClick }: { facility: Facility; index: number; onClick: () => void }) {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
		const { left, top } = currentTarget.getBoundingClientRect();
		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	}

	return (
		<motion.div
			className="group relative min-w-[300px] md:min-w-[400px] bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 snap-center border border-transparent hover:border-red-100"
			initial={{ opacity: 0, y: 50 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			viewport={{ once: true }}
			onClick={onClick}
			onMouseMove={handleMouseMove}
		>
			<motion.div
				className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-20"
				style={{
					background: useMotionTemplate`
						radial-gradient(
							600px circle at ${mouseX}px ${mouseY}px,
							rgba(220, 38, 38, 0.08),
							transparent 80%
						)
					`,
				}}
			/>
			{/* Image Container */}
			<div className="relative h-72 overflow-hidden z-10">
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
			<div className="p-6 relative z-10">
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
	);
}
