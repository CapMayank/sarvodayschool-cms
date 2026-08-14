/** @format */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";

const Hero = () => {
	const { scrollY } = useScroll();
	const y = useTransform(scrollY, [0, 500], [0, 150]);
	// Scroll indicator fades out as user scrolls
	const scrollIndicatorOpacity = useTransform(scrollY, [0, 200], [1, 0]);

	return (
		<section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
			{/* Background Image covers entire screen including behind navbar */}
			<motion.div
				className="absolute inset-0 z-[-2] w-full h-[120%]"
				style={{ y }}
			>
				<Image
					src="/bg.jpg"
					alt="Sarvodaya English Higher Secondary School Building"
					fill
					priority
					className="object-cover"
				/>
			</motion.div>

			{/* Gradient Overlay */}
			<div className="absolute inset-0 z-[-1] bg-linear-to-b from-black/20 via-transparent to-black/90" />

			{/* Hero Content */}
			<div className="w-[90%] mt-96 md:flex items-center animate-fadeUp z-10 relative">
				<div className="md:w-[60%] h-full">
					<h1 className="heading-text-yellow text-xl md:text-4xl font-black sm:mb-2 md:mb-4">
						WELCOME TO SARVODAYA ENGLISH HIGHER SECONDARY SCHOOL
					</h1>
					<p className="heading-text-red text-3xl md:text-5xl sm:mb-4 md:mb-8">
						Best Education &amp; Discipline Expertise
					</p>

					<div className="flex flex-wrap gap-4 mt-6">
						{/* Spotlight CTA Button */}
						<SpotlightButton href="/admission">
							Get Admission Now
						</SpotlightButton>

						{/* Ghost "Visit Campus" button */}
						<motion.a
							href="https://www.google.com/maps/place/Sarvodaya+Higher+Secondary+School+Lakhnadon/@22.600395,79.6115581,17z/data=!3m1!4b1!4m6!3m5!1s0x398016e5aebf0369:0xd1749e600ccabbcf!8m2!3d22.600395!4d79.6141384!16s%2Fg%2F11bwjdj890?entry=ttu"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 border-2 border-white/70 text-white font-bold px-6 py-3 rounded-lg backdrop-blur-sm hover:bg-white hover:text-gray-900 transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:border-white"
							whileHover={{ scale: 1.04 }}
							whileTap={{ scale: 0.97 }}
						>
							<MapPin size={18} />
							Visit Campus
						</motion.a>
					</div>
				</div>
			</div>

			{/* Scroll Indicator */}
			<motion.div
				className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 cursor-pointer"
				style={{ opacity: scrollIndicatorOpacity }}
				onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
			>
				<span className="text-white/70 text-xs font-medium tracking-widest uppercase">Scroll</span>
				<motion.div
					animate={{ y: [0, 8, 0] }}
					transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
				>
					<ChevronDown className="text-white/80 w-6 h-6" />
				</motion.div>
			</motion.div>
		</section>
	);
};

function SpotlightButton({ href, children }: { href: string; children: React.ReactNode }) {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
		const { left, top } = currentTarget.getBoundingClientRect();
		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	}

	return (
		<Link href={href} onMouseMove={handleMouseMove} className="group relative overflow-hidden bg-red-600 text-white font-bold px-7 py-3 rounded-lg shadow-lg transition-all hover:bg-red-700 hover:shadow-red-900/40 hover:shadow-xl">
			<motion.div
				className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10"
				style={{
					background: useMotionTemplate`radial-gradient(70px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.35), transparent 80%)`,
				}}
			/>
			<span className="relative z-20">{children}</span>
		</Link>
	);
}

export default Hero;
