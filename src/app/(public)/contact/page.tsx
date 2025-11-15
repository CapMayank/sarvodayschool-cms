/** @format */

"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import faqData from "@/lib/faqs/faqData";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export default function ContactPage() {
	// Add this function at the top of your component
	const calculateYears = () => {
		const foundingDate = new Date("2002-06-10");
		const today = new Date();
		let years = today.getFullYear() - foundingDate.getFullYear();

		// Adjust year if we haven't reached the founding day/month this year
		const m = today.getMonth() - foundingDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < foundingDate.getDate())) {
			years--;
		}

		return `${years}+`;
	};

	return (
		<>
			<Header title="Contact Us" />

			<div className="max-w-7xl mx-auto px-4 py-16">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Contact Information */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="bg-white rounded-xl shadow-xl overflow-hidden"
					>
						<div className="bg-linear-to-r from-red-600 to-red-500 py-8 px-6">
							<h2 className="text-3xl font-bold text-white">
								Contact Information
							</h2>
							<p className="text-white/90 mt-2">
								Reach out to us through any of these channels
							</p>
						</div>

						<div className="p-6 space-y-6">
							<div className="flex items-start space-x-4">
								<div className="bg-red-100 p-3 rounded-full">
									<MapPin className="h-6 w-6 text-red-500" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-800">
										School Address
									</h3>
									<a
										href="https://www.google.com/maps/place/Sarvodaya+Higher+Secondary+School+Lakhnadon/@22.600395,79.6115581,17z/data=!3m1!4b1!4m6!3m5!1s0x398016e5aebf0369:0xd1749e600ccabbcf!8m2!3d22.600395!4d79.6141384!16s%2Fg%2F11bwjdj890?entry=ttu"
										className="hover:text-blue-500 text-gray-600"
										target="_blank"
										rel="noopener noreferrer"
									>
										<p>
											Sarvodaya English Higher Secondary School,
											<br />
											Vinoba Bhave Ward no. 05, College Road, Lakhnadon
											<br />
											Lakhnadon, Seoni, Madhya Pradesh - 480886
										</p>
									</a>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="bg-red-100 p-3 rounded-full">
									<Phone className="h-6 w-6 text-red-500" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-600">Phone Numbers</h3>
									<a
										href="tel:+918989646850"
										className="hover:text-blue-500 text-gray-600"
									>
										+91 89896 46850
									</a>
									<br />
									<a
										href="tel:+918989646850"
										className="hover:text-blue-500 text-gray-600"
									>
										+91 94258 88317
									</a>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="bg-red-100 p-3 rounded-full">
									<Mail className="h-6 w-6 text-red-500" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-800">
										Email Addresses
									</h3>
									<p className="text-gray-600">
										General Inquiries:{" "}
										<a
											href="mailto:sarvodaya816@gmail.com"
											className="hover:text-blue-500"
										>
											sarvodaya816@gmail.com
										</a>
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="bg-red-100 p-3 rounded-full">
									<Clock className="h-6 w-6 text-red-500" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-800">Office Hours</h3>
									<p className="text-gray-600">
										Monday - Saturday: 10:00 AM - 4:30 PM
									</p>
								</div>
							</div>
						</div>

						{/* Social Media Links with Font Awesome */}
						<div className="p-6 border-t border-gray-200">
							<h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
							<div className="flex space-x-4">
								<a
									href="https://www.facebook.com/people/Sarvodaya-English-Higher-Secondary-School-Lakhnadon/61559633950802/"
									target="_blank"
									rel="noopener noreferrer"
									className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
									aria-label="Facebook"
								>
									<FontAwesomeIcon
										icon={faFacebookF as IconProp}
										className="w-5 h-5"
									/>
								</a>

								<a
									href="https://www.youtube.com/@sarvodayaschoollakhnadon"
									target="_blank"
									rel="noopener noreferrer"
									className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition"
									aria-label="YouTube"
								>
									<FontAwesomeIcon
										icon={faYoutube as IconProp}
										className="w-5 h-5"
									/>
								</a>
							</div>
						</div>
					</motion.div>
					{/* School Credentials - Static Content */}
					<div className="bg-gray-50 p-6 border-t border-gray-200">
						<h3 className="text-xl font-bold text-gray-800 mb-3">
							Our Credentials
						</h3>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{/* Accreditation Badge */}
							<div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
								<div className="bg-blue-100 p-3 rounded-full mb-3">
									<svg
										className="w-8 h-8 text-blue-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
										/>
									</svg>
								</div>
								<span className="font-semibold text-gray-800 text-center">
									MPBSE Affiliated
								</span>
								<span className="text-sm text-gray-500 mt-1 text-center">
									772070
								</span>
							</div>

							{/* Award Badge */}
							<div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
								<div className="bg-yellow-100 p-3 rounded-full mb-3">
									<svg
										className="w-8 h-8 text-yellow-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
										/>
									</svg>
								</div>
								<span className="font-semibold text-gray-800 text-center">
									Recognized by
								</span>
								<span className="text-sm text-gray-500 mt-1 text-center">
									MP Government
								</span>
							</div>

							{/* Experience Badge */}
							<div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
								<div className="bg-green-100 p-3 rounded-full mb-3">
									<svg
										className="w-8 h-8 text-green-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<span className="font-semibold text-gray-800 text-center">
									Years of Excellence
								</span>
								<span className="text-sm text-gray-500 mt-1 text-center">
									{calculateYears()} Years
								</span>
							</div>

							{/* Students Badge */}
							<div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
								<div className="bg-purple-100 p-3 rounded-full mb-3">
									<svg
										className="w-8 h-8 text-purple-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
								</div>
								<span className="font-semibold text-gray-800 text-center">
									Establishment
								</span>
								<span className="text-sm text-gray-500 mt-1 text-center">
									10 June 2002
								</span>
							</div>
						</div>

						{/* School Motto */}
						<div className="mt-6 text-center p-4 bg-red-50 rounded-lg border border-red-100">
							<p className="text-gray-700 italic">
								&quot;Best Education and Best Discipline&quot;
							</p>
							<p className="text-sm text-gray-600 mt-1">
								Our commitment since establishment
							</p>
						</div>
						{/* School Statistics - Numbers */}
						<div className="mt-8 bg-linear-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6 shadow-sm">
							<h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
								School by Numbers
							</h3>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<div className="text-center">
									<div className="text-4xl font-bold text-red-600 mb-1">
										{calculateYears()}
									</div>
									<div className="text-sm text-gray-600">
										Years of Excellence
									</div>
								</div>

								<div className="text-center">
									<div className="text-4xl font-bold text-red-600 mb-1">
										30+
									</div>
									<div className="text-sm text-gray-600">Faculty Members</div>
								</div>

								<div className="text-center">
									<div className="text-4xl font-bold text-red-600 mb-1">
										900+
									</div>
									<div className="text-sm text-gray-600">Happy Students</div>
								</div>

								<div className="text-center">
									<div className="text-4xl font-bold text-red-600 mb-1">
										100%
									</div>
									<div className="text-sm text-gray-600">Result</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Google Map */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.6 }}
					className="mt-12 rounded-xl overflow-hidden shadow-xl h-[400px] md:h-[500px]"
				>
					<iframe
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4306.923615136501!2d79.61185821147447!3d22.600525079386248!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398016e5aebf0369%3A0xd1749e600ccabbcf!2sSarvodaya%20Higher%20Secondary%20School%20Lakhnadon!5e1!3m2!1sen!2sin!4v1743594574489!5m2!1sen!2sin"
						width="100%"
						height="100%"
						style={{ border: 0 }}
						allowFullScreen={true}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
					></iframe>
				</motion.div>

				{/* FAQ Section */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.8 }}
					className="mt-16"
				>
					<h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
						Frequently Asked Questions
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{faqData.map((faq, index) => (
							<div
								key={index}
								className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
							>
								<h3 className="font-bold text-xl text-red-500 mb-2">
									{faq.question}
								</h3>
								<p className="text-gray-700">{faq.answer}</p>
							</div>
						))}
					</div>
				</motion.div>
			</div>

			<Footer />
		</>
	);
}
