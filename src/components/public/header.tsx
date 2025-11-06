/** @format */
"use client";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface HeaderProps {
	title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
	const location = usePathname();
	const path = location.split("/")[1];

	return (
		// <section className="text-center mt-50 my-8 p-8 ">
		// 	<Image
		// 		className="absolute inset-0 z-[-2] w-full h-[1024px] md:h-[500px] object-cover"
		// 		src="/back.webp"
		// 		alt="Sarvodaya School Students"
		// 		width={2000}
		// 		height={1333}
		// 	/>

		// 	{/* Dark Overlay */}
		// 	<div className="absolute inset-0 z-[-1] h-[1024px] md:h-[500px] bg-black/30"></div>

		// 	{/* Content */}
		// 	<div className="flex flex-col items-center justify-center px-4">
		// 		<motion.div
		// 			initial={{ opacity: 0, y: 20 }}
		// 			animate={{ opacity: 1, y: 0 }}
		// 			transition={{ duration: 0.5 }}
		// 			className="text-center"
		// 		>
		// 			{/* Breadcrumb */}
		// 			<div className="flex items-center justify-center space-x-2 mb-4">
		// 				<span className="text-white font-bold shadow-md text-lg md:text-2xl">
		// 					Home
		// 				</span>
		// 				<span className="heading-text-red font-bold text-lg md:text-2xl">
		// 					/
		// 				</span>
		// 				<span className="heading-text-red font-bold capitalize text-lg md:text-2xl">
		// 					{path}
		// 				</span>
		// 			</div>

		// 			{/* Title */}
		// 			<motion.h1
		// 				initial={{ opacity: 0, y: 20 }}
		// 				animate={{ opacity: 1, y: 0 }}
		// 				transition={{ duration: 0.5, delay: 0.2 }}
		// 				className="text-4xl md:text-6xl font-bold"
		// 			>
		// 				<span className="bg-clip-text text-transparent heading-text-yellow">
		// 					{title}
		// 				</span>
		// 			</motion.h1>

		// 			{/* Decorative Element */}
		// 			<motion.div
		// 				initial={{ scaleX: 0 }}
		// 				animate={{ scaleX: 1 }}
		// 				transition={{ duration: 0.5, delay: 0.4 }}
		// 				className="mt-4 w-24 h-1 bg-gradient-to-r from-red-600 to-red-500 mx-auto rounded-full"
		// 			/>
		// 		</motion.div>
		// 	</div>
		// </section>

		<section className="relative w-full flex items-center justify-center text-center mt-20 py-24 md:pt-32 overflow-hidden">
			{/* ✅ Background Image (Hero-like, no weird cropping) */}
			<div className="absolute inset-0 z-[-2]">
				<Image
					src="/back.webp"
					alt="Background"
					fill
					sizes="100vw"
					className="object-cover"
					priority
				/>
			</div>

			{/* ✅ Dark overlay for readability */}
			<div className="absolute inset-0 bg-black/40 z-[-1]" />

			{/* ✅ Content */}
			<motion.div
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="px-6 md:px-12 max-w-4xl"
			>
				{/* Breadcrumb */}
				<div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
					<span className="text-white font-bold text-lg md:text-2xl">Home</span>
					<span className="text-red-500 font-bold text-lg md:text-2xl">/</span>
					<span className="heading-text-red font-bold capitalize text-lg md:text-2xl">
						{path}
					</span>
				</div>

				{/* Title */}
				<h1 className="text-3xl sm:text-4xl md:text-6xl font-black heading-text-yellow drop-shadow-xl">
					{title}
				</h1>

				{/* Decorative Line */}
				<motion.div
					initial={{ scaleX: 0 }}
					animate={{ scaleX: 1 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="mt-4 w-24 h-1 bg-linear-to-r from-red-600 to-red-400 mx-auto rounded-full"
				/>
			</motion.div>
		</section>
	);
};

export default Header;
