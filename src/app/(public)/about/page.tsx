/** @format */
"use client";
import React from "react";
import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import Image from "next/image";
import { motion } from "framer-motion";
import {
	Book,
	Shield,
	Building2,
	Users,
	ShieldCheck,
	Rocket,
} from "lucide-react";

const About = () => {
	const features = [
		{
			icon: <Book className="w-8 h-8 text-red-600" />,
			title: "Quality Education",
			description:
				"Committed to delivering top-notch education to students from Lakhnadon and neighboring regions.",
		},
		{
			icon: <ShieldCheck className="w-8 h-8 text-red-600" />,
			title: "Strong Discipline",
			description:
				"We instill a sense of responsibility and discipline to build character and lifelong habits.",
		},
		{
			icon: <Rocket className="w-8 h-8 text-red-600" />,
			title: "Inspired Motivation",
			description:
				"We cultivate a growth mindset, encouraging students to stay motivated and strive for their personal best.",
		},
		{
			icon: <Shield className="w-8 h-8 text-red-600" />,
			title: "Safety First",
			description:
				"Student safety is our priority, backed by modern security measures and strict protocols.",
		},
		{
			icon: <Building2 className="w-8 h-8 text-red-600" />,
			title: "Advanced Facilities",
			description:
				"Smart classrooms and well-equipped labs enrich the learning experience.",
		},
		{
			icon: <Users className="w-8 h-8 text-red-600" />,
			title: "Equal Opportunities",
			description:
				"We believe in accessible education for all, ensuring every student thrives regardless of their background.",
		},
	];

	return (
		<>
			<Header title="About" />

			{/* Hero Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative bg-linear-to-b from-white to-gray-50 py-16"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<Image
							src="/logoMin.png"
							alt="School Logo"
							width={180}
							height={180}
							className="mx-auto mb-8 drop-shadow-xl"
						/>
						<h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-red-600 to-red-500">
							Welcome to Sarvodaya English Higher Secondary School
						</h1>
						<p className="mt-4 text-xl text-gray-600 font-medium">
							Run by Vishwakarma Shiksha Prasar Samiti
						</p>
					</div>
				</div>
			</motion.div>

			{/* Features Grid */}
			<div className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
						Why Choose <span className="text-red-600">Us?</span>
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
							>
								<div className="bg-red-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
									{feature.icon}
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-2">
									{feature.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{feature.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Director Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-linear-to-b from-gray-50 to-white py-16"
			>
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
						<div className="flex flex-col md:flex-row items-center p-8 gap-8">
							<div className="relative">
								<div className="absolute inset-0 bg-linear-to-r from-red-600 to-red-500 rounded-full blur-lg opacity-20"></div>
								<Image
									src="/directors.png"
									alt="Dr. Mangal Vishwakarma"
									width={280}
									height={280}
									className="rounded-full relative shadow-2xl"
								/>
							</div>
							<div className="flex-1 text-center md:text-left">
								<h2 className="text-4xl font-bold text-yellow-600 mb-2">
									Director
								</h2>
								<h3 className="text-3xl font-bold text-red-600 mb-2">
									Dr. Mangal Vishwakarma
								</h3>
								<p className="text-gray-600 font-medium mb-4">
									PhD, M.Phil, M.Com, M.A, B.Ed
								</p>
								<blockquote className="text-gray-700 text-lg italic border-l-4 border-red-500 pl-4">
									&quot;At Sarvodaya English Higher Secondary School, we believe
									that education and discipline are the foundation of success.
									Our mission is to nurture young minds with knowledge,
									integrity, and a strong sense of responsibility. Through a
									disciplined learning environment, we strive to shape students
									into confident, capable individuals ready to excel in
									academics and life.&quot;
								</blockquote>
							</div>
						</div>
					</div>
				</div>
			</motion.div>

			<Footer />
		</>
	);
};

export default About;
