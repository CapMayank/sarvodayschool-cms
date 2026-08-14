/** @format */
"use client";
import React from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { GraduationCap, Users, Trophy, BookOpen } from "lucide-react";

const AnimatedNumber = ({ value }: { value: string }) => {
	const count = useMotionValue(0);
	const rounded = useTransform(count, (latest) => Math.round(latest));
	const [ref, inView] = useInView({ triggerOnce: true });

	React.useEffect(() => {
		if (inView) {
			const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
			const animation = animate(count, numericValue, {
				duration: 1.8,
				ease: "easeOut",
			});
			return animation.stop;
		}
	}, [count, value, inView]);

	return <motion.span ref={ref}>{rounded}</motion.span>;
};

const Banner = () => {
	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});

	const bannerData = [
		{
			icon: <GraduationCap className="w-14 h-14 text-white" strokeWidth={1.5} />,
			iconLabel: "Students icon",
			data: "900+",
			title: "STUDENTS",
		},
		{
			icon: <Users className="w-14 h-14 text-white" strokeWidth={1.5} />,
			iconLabel: "Teachers icon",
			data: "30+",
			title: "TRAINED TEACHERS",
		},
		{
			icon: <Trophy className="w-14 h-14 text-white" strokeWidth={1.5} />,
			iconLabel: "Result trophy icon",
			data: "100%",
			title: "RESULT",
		},
		{
			icon: <BookOpen className="w-14 h-14 text-white" strokeWidth={1.5} />,
			iconLabel: "Streams icon",
			data: "Science, Commerce",
			title: "STREAMS",
		},
	];

	return (
		<section className="relative w-full">
			{/* ✅ Banner Content */}
			<div
				ref={ref}
				className="relative mx-auto p-6 md:p-10 bg-black/40 backdrop-blur-xs border border-white/20 shadow-xl overflow-hidden"
			>
				{/* Next.js Optimized Background Image */}
				<Image
					src="/banner.jpg"
					alt="Banner Background"
					fill
					quality={80}
					className="object-cover z-[-1]"
				/>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white relative z-10">
					{bannerData.map((val, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={inView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.5, delay: index * 0.2 }}
							className="flex items-center gap-3"
						>
							<span aria-label={val.iconLabel} role="img">{val.icon}</span>
							<div>
								<h2 className="text-xl md:text-3xl font-bold">
									{val.data.includes("+") ? (
										<>
											<AnimatedNumber value={val.data} />+
										</>
									) : (
										val.data
									)}
								</h2>
								<p className="text-sm md:text-lg font-semibold opacity-90">
									{val.title}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Banner;
