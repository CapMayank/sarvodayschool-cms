/** @format */

"use client";
import React, { useState } from "react";
import Footer from "@/components/public/footer";
import Header from "@/components/public/header";
import Modal from "@/components/public/Modal";
import { motion } from "framer-motion";
import { FileCheck, Upload, Phone } from "lucide-react";

interface AdmissionFormData {
	studentName: string;
	gender: string;
	dateOfBirth: string;
	fatherName: string;
	motherName: string;
	mobileNumber: string;
	alternateMobile: string;
	class: string;
	district: string;
	block: string;
	address: string;
	previousSchool: string;
}

interface Districts {
	[key: string]: string[];
}

const districts: Districts = {
	Seoni: [
		"Lakhnadon",
		"Seoni",
		"Ghansor",
		"Keolari",
		"Barghat",
		"Kurai",
		"Dhanora",
	],
	Jabalpur: [
		"Jabalpur",
		"Shahpura",
		"Panagar",
		"Sihora",
		"Majholi",
		"Kundam",
		"Patan",
	],
	Narsinghpur: ["Narsinghpur", "Gadarwara", "Tendukheda", "Kareli", "Gotegaon"],
	Mandla: ["Mandla", "Bichhiya", "Ghughri", "Nainpur", "Niwas"],
	Balaghat: [
		"Balaghat",
		"Baihar",
		"Katangi",
		"Lanji",
		"Waraseoni",
		"Khairlanji",
	],
	Chhindwara: [
		"Chhindwara",
		"Parasia",
		"Sausar",
		"Pandhurna",
		"Mohan Nagar",
		"Amarwara",
	],
	Betul: ["Betul", "Multai", "Amla", "Sarni", "Bhainsdehi"],
	Narmadapuram: [
		"Narmadapuram",
		"Itarsi",
		"Pipariya",
		"Seoni Malwa",
		"Sohagpur",
	],
	Raisen: [
		"Raisen",
		"Begamganj",
		"Goharganj",
		"Obedullaganj",
		"Silwani",
		"Udaipura",
	],
};

const feeStructure = [
	{ class: "Nursery", fee: 8690 },
	{ class: "K.G.I", fee: 9910 },
	{ class: "K.G.II", fee: 10580 },
	{ class: "1st", fee: 11120 },
	{ class: "2nd", fee: 11470 },
	{ class: "3rd", fee: 11880 },
	{ class: "4th", fee: 12170 },
	{ class: "5th", fee: 12610 },
	{ class: "6th", fee: 13620 },
	{ class: "7th", fee: 13940 },
	{ class: "8th", fee: 15710 },
	{ class: "9th", fee: 19125 },
	{ class: "10th", fee: 20655 },
	{ class: "11th", fee: 21950 },
	{ class: "12th", fee: 22160 },
];

const requiredDocuments = [
	{
		title: "Identity Proof",
		icon: FileCheck,
		items: [
			"Aadhar Card Photocopy",
			"Birth Certificate Attested Photocopy",
			"Samagra ID (SSSM ID) Photocopy",
			"Previous School TC Original (if applicable)",
			"Caste Certificate of the Child",
		],
	},
	{
		title: "Academic Records",
		items: [
			"Previous Year's Report Card Photocopy",
			"Transfer Certificate Original",
			"Character Certificate",
		],
	},
	{
		title: "Financial Documents",
		items: [
			"Bank Passbook Photocopy",
			"BPL Card Photocopy (if eligible)",
			"Karmkar Card Photocopy (if applicable)",
		],
	},
	{
		title: "Photographs",
		items: [
			"Three latest passport-size photographs of the student",
			"One latest passport-size photograph of the mother",
			"One latest passport-size photograph of the father",
		],
	},
	{
		title: "Address Parent Verification",
		items: ["Residence Proof", "Father's and Mother's Aadhaar Card"],
	},
];

export default function Admission() {
	const [formData, setFormData] = useState<AdmissionFormData>({
		studentName: "",
		gender: "",
		dateOfBirth: "",
		fatherName: "",
		motherName: "",
		mobileNumber: "",
		alternateMobile: "",
		class: "",
		district: "",
		block: "",
		address: "",
		previousSchool: "",
	});

	const [showModal, setShowModal] = useState(false);
	// const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;

		if (name === "district") {
			setFormData({
				...formData,
				district: value,
				block: "",
			});
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setSubmitting(true);
		try {
			const response = await fetch("/api/admission-forms", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					studentName: formData.studentName,
					gender: formData.gender,
					dateOfBirth: formData.dateOfBirth,
					fatherName: formData.fatherName,
					motherName: formData.motherName,
					mobileNumber: formData.mobileNumber,
					alternateMobile: formData.alternateMobile,
					class: formData.class,
					district: formData.district,
					block: formData.block,
					address: formData.address,
					previousSchool: formData.previousSchool,
					status: "pending",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to submit form");
			}

			// const data = await response.json();
			setSubmitMessage({
				type: "success",
				text: `Application submitted successfully! We will review your application and contact you soon.`,
			});

			// Reset form
			setFormData({
				studentName: "",
				gender: "",
				dateOfBirth: "",
				fatherName: "",
				motherName: "",
				mobileNumber: "",
				alternateMobile: "",
				class: "",
				district: "",
				block: "",
				address: "",
				previousSchool: "",
			});

			// Clear message after 5 seconds
			setTimeout(() => setSubmitMessage(null), 5000);
		} catch (err) {
			console.error("Error submitting form:", err);
			setSubmitMessage({
				type: "error",
				text: "Failed to submit application. Please try again.",
			});
			setTimeout(() => setSubmitMessage(null), 5000);
		} finally {
			setSubmitting(false);
		}
	};

	// const openModal = (imageUrl: string) => {
	// 	setSelectedImage(imageUrl);
	// 	setShowModal(true);
	// };

	return (
		<>
			<Header title="Admission" />
			<div className="min-h-screen bg-linear-to-b from-white to-gray-50">
				{/* Submit Message Alert */}
				{submitMessage && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className={`fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
							submitMessage.type === "success" ? "bg-green-600" : "bg-red-600"
						}`}
					>
						{submitMessage.text}
					</motion.div>
				)}

				<div className="max-w-7xl mx-auto px-4 py-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Admission Form */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="bg-white rounded-xl shadow-lg overflow-hidden"
						>
							<div className="bg-linear-to-r from-gray-800 to-gray-700 p-6">
								<h2 className="text-2xl font-bold text-white flex items-center">
									<Phone className="mr-2" /> Enquire Admission
								</h2>
								<p className="text-white/80 mt-2">
									Fill in all the required details
								</p>
							</div>

							<form onSubmit={handleSubmit} className="p-6 space-y-6">
								{/* Student Information Section */}
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
									<h3 className="text-lg font-bold text-gray-800">
										Student Information
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Student Name <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												name="studentName"
												value={formData.studentName}
												onChange={handleChange}
												className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Gender <span className="text-red-500">*</span>
											</label>
											<select
												name="gender"
												value={formData.gender}
												onChange={handleChange}
												className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
												required
											>
												<option value="">Select Gender</option>
												<option value="Male">Male</option>
												<option value="Female">Female</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Date of Birth <span className="text-red-500">*</span>
											</label>
											<input
												type="date"
												name="dateOfBirth"
												value={formData.dateOfBirth}
												onChange={handleChange}
												className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Previous School (if any)
											</label>
											<input
												type="text"
												name="previousSchool"
												value={formData.previousSchool}
												onChange={handleChange}
												className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
											/>
										</div>
									</div>
								</div>

								{/* Academic Information */}
								<div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
									<h3 className="text-lg font-bold text-gray-800">
										Academic Information
									</h3>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Class for Admission{" "}
											<span className="text-red-500">*</span>
										</label>
										<select
											name="class"
											value={formData.class}
											onChange={handleChange}
											className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
											required
										>
											<option value="">Select Class</option>
											<option value="Nursery">Nursery</option>
											<option value="KG I">KG I</option>
											<option value="KG II">KG II</option>
											{Array.from({ length: 12 }, (_, i) => (
												<option key={i + 1} value={`${i + 1}`}>
													{i + 1}th
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Parent Information */}
								<div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
									<h3 className="text-lg font-bold text-gray-800">
										Parent Information
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Father&apos;s Name{" "}
												<span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												name="fatherName"
												value={formData.fatherName}
												onChange={handleChange}
												className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Mother&apos;s Name{" "}
												<span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												name="motherName"
												value={formData.motherName}
												onChange={handleChange}
												className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
												required
											/>
										</div>
									</div>
								</div>

								{/* Contact Information */}
								<div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
									<h3 className="text-lg font-bold text-gray-800">
										Contact Information
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Mobile Number <span className="text-red-500">*</span>
											</label>
											<input
												type="tel"
												name="mobileNumber"
												value={formData.mobileNumber}
												onChange={handleChange}
												className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Alternate Mobile
											</label>
											<input
												type="tel"
												name="alternateMobile"
												value={formData.alternateMobile}
												onChange={handleChange}
												className="w-full p-2.5 text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
											/>
										</div>
									</div>
								</div>

								{/* Address Information */}
								<div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
									<h3 className="text-lg font-bold text-gray-800">
										Address Information
									</h3>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Complete Address <span className="text-red-500">*</span>
										</label>
										<textarea
											name="address"
											value={formData.address}
											onChange={handleChange}
											rows={3}
											className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
											required
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												District <span className="text-red-500">*</span>
											</label>
											<select
												name="district"
												value={formData.district}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 required"
												required
											>
												<option value="">Select District</option>
												{Object.keys(districts).map((district) => (
													<option key={district} value={district}>
														{district}
													</option>
												))}
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Block <span className="text-red-500">*</span>
											</label>
											<select
												name="block"
												value={formData.block}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 required"
												disabled={!formData.district}
												required
											>
												<option value="">Select Block</option>
												{formData.district &&
													districts[formData.district]?.map((block) => (
														<option key={block} value={block}>
															{block}
														</option>
													))}
											</select>
										</div>
									</div>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={submitting}
									className={`w-full p-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition ${
										!submitting
											? "bg-red-600 hover:bg-red-700 text-white"
											: "bg-gray-300 cursor-not-allowed text-gray-500"
									}`}
								>
									<Upload className="w-5 h-5" />
									<span>
										{submitting ? "Submitting..." : "Submit Application"}
									</span>
								</button>
							</form>
						</motion.div>

						{/* Fee Structure Card */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="bg-white rounded-xl shadow-lg overflow-hidden"
						>
							<div className="bg-linear-to-r from-gray-800 to-gray-700 p-6">
								<h2 className="text-2xl font-bold text-white flex items-center">
									<Upload className="mr-2" /> Fee Structure
								</h2>
								<p className="text-white/80 mt-2">Academic Session 2025-26</p>
							</div>

							<div className="p-6 overflow-auto ">
								<div className="overflow-hidden rounded-lg border border-gray-200">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-linear-to-r from-gray-50 to-gray-100">
											<tr>
												<th className="px-6 py-4 text-left text-base font-bold text-gray-900">
													S.N.
												</th>
												<th className="px-6 py-4 text-left text-base font-bold text-gray-900">
													Class
												</th>
												<th className="px-6 py-4 text-left text-base font-bold text-gray-900">
													Total Fee
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200 bg-white">
											{feeStructure.map((item, index) => (
												<motion.tr
													key={index}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.05 }}
													className="hover:bg-gray-50 transition-colors"
												>
													<td className="px-6 py-4 text-base text-gray-700">
														{index + 1}
													</td>
													<td className="px-6 py-4 text-base font-medium text-gray-900">
														{item.class}
													</td>
													<td className="px-6 py-4 text-base text-gray-900">
														<span className="font-bold text-red-600">
															₹{item.fee.toLocaleString("en-IN")}
														</span>
													</td>
												</motion.tr>
											))}
										</tbody>
										<tfoot className="bg-linear-to-r from-gray-50 to-gray-100">
											<tr>
												<td
													colSpan={3}
													className="px-6 py-4 text-base text-gray-600 text-center italic"
												>
													Fee structure is subject to change as per school
													management decision
												</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Required Documents Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="mt-12 bg-linear-to-br from-white to-gray-50 rounded-xl shadow-lg p-6"
					>
						<h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
							<FileCheck className="mr-3 text-red-600 w-8 h-8" /> Required
							Documents
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
							{requiredDocuments.map((category, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									className="bg-white rounded-lg p-5 border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-md"
								>
									<h3 className="font-bold text-red-600 text-lg mb-4 flex items-center gap-2">
										{category.title}
									</h3>
									<ul className="space-y-3">
										{category.items.map((item, idx) => (
											<motion.li
												key={idx}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{
													delay: index * 0.1 + idx * 0.05,
												}}
												className="text-sm text-gray-700 flex items-start gap-2"
											>
												<span className="text-red-500 font-bold mt-1">•</span>
												<span>{item}</span>
											</motion.li>
										))}
									</ul>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</div>

			{showModal && selectedImage && (
				<Modal
					showModal={showModal}
					setShowModal={setShowModal}
					imageUrl={selectedImage}
				/>
			)}

			<Footer />
		</>
	);
}
