/** @format */

"use client";
import React from "react";
import { motion } from "framer-motion";
import {
	FaFacebook,
	FaYoutube,
	FaPhone,
	FaEnvelope,
	FaMapMarkerAlt,
	FaGraduationCap,
	FaBook,
	FaUserTie,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
	const quickLinks = [
		{ title: "Admissions", href: "/admission", icon: <FaGraduationCap /> },
		{ title: "Results", href: "/result", icon: <FaBook /> },
		{ title: "Careers", href: "/careers", icon: <FaUserTie /> },
	];

	return (
		<footer className="bg-linear-to-b from-gray-50 to-white pt-16 pb-8">
			<div className="max-w-7xl mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
					{/* School Info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="col-span-1 lg:col-span-2"
					>
						<div className="flex items-center gap-4 mb-6">
							<Image
								src="/logoMin.png"
								alt="School Logo"
								width={80}
								height={80}
								className="drop-shadow-xl"
							/>
							<h3 className="text-xl font-bold text-gray-800">
								Sarvodaya English Higher Secondary School
							</h3>
						</div>
						<p className="text-gray-600 mb-6">
							Providing the best education with strong values, academic
							excellence, and character-building to shape future leaders. Since
							- 2002
						</p>
					</motion.div>

					{/* Quick Links */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<h3 className="text-lg font-bold text-gray-800 mb-6">
							Quick Links
						</h3>
						<ul className="space-y-4">
							{quickLinks.map((link, index) => (
								<li key={index}>
									<Link
										href={link.href}
										className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
									>
										{link.icon}
										<span>{link.title}</span>
									</Link>
								</li>
							))}
						</ul>
					</motion.div>

					{/* Contact Info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<h3 className="text-lg font-bold text-gray-800 mb-6">Contact Us</h3>
						<div className="space-y-4">
							<a
								href="https://maps.app.goo.gl/HsDwyxCYGAG7BEVHA"
								className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
								target="_blank"
								rel="noopener noreferrer"
							>
								<FaMapMarkerAlt className="text-red-600" />
								<span>Lakhnadon, Seoni, Madhya Pradesh</span>
							</a>
							<a
								href="tel:+918989646850"
								className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
							>
								<FaPhone className="text-red-600" />
								<span>+91 89896 46850</span>
							</a>
							<a
								href="mailto:sarvodaya816@gmail.com"
								className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
							>
								<FaEnvelope className="text-red-600" />
								<span>sarvodaya816@gmail.com</span>
							</a>
						</div>
					</motion.div>
				</div>

				{/* Social Links & Copyright */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="mt-12 pt-8 border-t border-gray-200"
				>
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="flex gap-4">
							<a
								href="https://www.facebook.com/people/Sarvodaya-English-Higher-Secondary-School-Lakhnadon/61559633950802/"
								target="_blank"
								rel="noopener noreferrer"
								className="bg-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
							>
								<FaFacebook className="text-xl text-red-600 group-hover:scale-110 transition-transform" />
							</a>
							<a
								href="https://www.youtube.com/@sarvodayaschoollakhnadon"
								target="_blank"
								rel="noopener noreferrer"
								className="bg-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
							>
								<FaYoutube className="text-xl text-red-600 group-hover:scale-110 transition-transform" />
							</a>
						</div>
						<div className="text-center md:text-right text-gray-600">
							<p>
								&copy; {new Date().getFullYear()} Sarvodaya English Higher
								Secondary School
							</p>
							<p className="mt-1">
								Designed and Developed by{" "}
								<a
									href="https://capmayank.github.io/portfolio"
									target="_blank"
									rel="noopener noreferrer"
									className="text-red-600 hover:text-red-700 font-medium"
								>
									Mayank Vishwakarma
								</a>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</footer>
	);
};

export default Footer;
