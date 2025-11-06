/** @format */
"use client";
import React from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useInView } from "react-intersection-observer";

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
			cover:
				"https://img.icons8.com/external-yogi-aprelliyanto-basic-outline-yogi-aprelliyanto/80/ffffff/external-graduation-education-yogi-aprelliyanto-basic-outline-yogi-aprelliyanto.png",
			data: "900+",
			title: "STUDENTS",
		},
		{
			cover: "https://img.icons8.com/ios/80/ffffff/athlete.png",
			data: "30+",
			title: "TRAINED TEACHERS",
		},
		{
			cover:
				"https://img.icons8.com/external-outline-icons-maxicons/80/ffffff/external-calender-insurance-outline-outline-icons-maxicons.png",
			data: "100%",
			title: "RESULT",
		},
		{
			cover: "https://img.icons8.com/ios/80/ffffff/macbook-idea--v3.png",
			data: "Science, Commerce",
			title: "STREAMS",
		},
	];

	return (
		<section className="relative w-full">
			{/* ✅ Banner Content */}
			<div
				ref={ref}
				className="relative mx-auto p-6 md:p-10 bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl"
				style={{
					backgroundImage: "url('/banner.jpg')",
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
					{bannerData.map((val, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={inView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.5, delay: index * 0.2 }}
							className="flex items-center gap-3"
						>
							<Image src={val.cover} alt="icon" width={60} height={60} />
							<div>
								<h1 className="text-xl md:text-3xl font-bold">
									{val.data.includes("+") ? (
										<>
											<AnimatedNumber value={val.data} />+
										</>
									) : (
										val.data
									)}
								</h1>
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
