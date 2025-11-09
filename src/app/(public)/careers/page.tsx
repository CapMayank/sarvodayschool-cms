/** @format */

"use client";
import React, { useState, useCallback } from "react";
import Footer from "@/components/public/footer";
import Header from "@/components/public/header";
import Modal from "@/components/public/Modal";
import ResumeUpload from "@/components/ResumeUpload";
import Image from "next/image";
import { motion } from "framer-motion";
import {
	Briefcase,
	GraduationCap,
	Clock,
	Book,
	Users,
	Send,
} from "lucide-react";

interface TeacherFormData {
	name: string;
	gender: string;
	mobileNumber: string;
	address: string;
	district: string;
	block: string;
	qualifications: string;
	specialization: string;
	professionalQualification: string;
	otherProfessionalQualification: string;
	subject: string;
	class: string;
	experience: string;
	resumeUrl: string;
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

const Careers: React.FC = () => {
	const [formData, setFormData] = useState<TeacherFormData>({
		name: "",
		gender: "",
		mobileNumber: "",
		address: "",
		district: "",
		block: "",
		qualifications: "",
		specialization: "",
		professionalQualification: "",
		otherProfessionalQualification: "",
		subject: "",
		class: "",
		experience: "",
		resumeUrl: "",
	});

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [blocks, setBlocks] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [submitMessage, setSubmitMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;

		if (name === "district") {
			setFormData((prevData) => ({
				...prevData,
				district: value,
				block: "",
			}));
		} else {
			setFormData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		}
	};

	// Handle file selection (doesn't upload yet)
	const handleFileSelect = useCallback((file: File | null) => {
		setSelectedFile(file);
	}, []);

	// Upload file to Cloudinary
	const uploadResumeToCloudinary = async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append(
			"upload_preset",
			process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
		);
		formData.append("folder", "sarvodaya/resumes");

		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
			{
				method: "POST",
				body: formData,
			}
		);

		if (!response.ok) {
			throw new Error("Failed to upload resume to Cloudinary");
		}

		const data = await response.json();
		return data.secure_url;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Validate resume
		if (!selectedFile && !formData.resumeUrl) {
			setSubmitMessage({
				type: "error",
				text: "Please upload your resume to proceed. Cannot submit until resume is uploaded.",
			});
			setTimeout(() => setSubmitMessage(null), 5000);
			return;
		}

		setSubmitting(true);
		setUploadProgress(0);

		try {
			let resumeUrl = formData.resumeUrl; // Use existing URL if available

			// Upload resume if a new file was selected
			if (selectedFile) {
				setUploadProgress(10);
				setSubmitMessage({
					type: "success",
					text: "Uploading resume...",
				});

				resumeUrl = await uploadResumeToCloudinary(selectedFile);
				setUploadProgress(40);
			}

			setUploadProgress(50);
			setSubmitMessage({
				type: "success",
				text: "Submitting application...",
			});

			const response = await fetch("/api/teacher-applications", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					gender: formData.gender,
					mobileNumber: formData.mobileNumber,
					address: formData.address,
					district: formData.district,
					block: formData.block,
					qualifications: formData.qualifications,
					specialization: formData.specialization,
					professionalQualification: formData.professionalQualification,
					otherProfessionalQualification:
						formData.otherProfessionalQualification,
					subject: formData.subject,
					class: formData.class,
					experience: parseInt(formData.experience),
					resumeUrl: resumeUrl, // Use the uploaded URL
					status: "New",
				}),
			});

			setUploadProgress(80);

			if (!response.ok) {
				throw new Error("Failed to submit form");
			}

			setUploadProgress(100);

			// const data = await response.json();
			setSubmitMessage({
				type: "success",
				text: `Application submitted successfully! We will review your application and contact you soon.`,
			});

			// Reset form ONLY after successful submission
			setSelectedFile(null);
			setFormData({
				name: "",
				gender: "",
				mobileNumber: "",
				address: "",
				district: "",
				block: "",
				qualifications: "",
				specialization: "",
				professionalQualification: "",
				otherProfessionalQualification: "",
				subject: "",
				class: "",
				experience: "",
				resumeUrl: "",
			});

			setTimeout(() => setSubmitMessage(null), 7000);
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

	const openModal = (imageUrl: string) => {
		setSelectedImage(imageUrl);
		setShowModal(true);
	};

	return (
		<>
			<Header title="Careers" />
			<div className="min-h-screen bg-linear-to-b from-white to-gray-50">
				{/* Submit Message Alert */}
				{submitMessage && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className={`fixed top-4 right-4 p-4 rounded-lg text-white z-50 max-w-sm shadow-lg ${
							submitMessage.type === "success" ? "bg-green-600" : "bg-red-600"
						}`}
					>
						<div className="flex flex-col gap-2">
							{submitMessage.text}
							{submitting && uploadProgress > 0 && (
								<div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
									<div
										className="bg-white h-full transition-all duration-300"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
							)}
						</div>
					</motion.div>
				)}

				<div className="max-w-7xl mx-auto px-4 py-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Job Information Card */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="bg-white rounded-xl shadow-lg overflow-hidden"
						>
							<div className="p-6">
								<h2 className="text-2xl font-bold text-gray-800 mb-6">
									Position Requirements
								</h2>

								<div className="space-y-6">
									{/* Subjects Required */}
									<div className="flex items-start space-x-4">
										<div className="bg-red-100 p-3 rounded-full shrink-0">
											<Book className="h-6 w-6 text-red-500" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-800">
												Subjects Required
											</h3>
											<p className="text-gray-600 text-sm">
												English, Mathematics, Biology, Physics, Chemistry,
												Social Science, Hindi, Sanskrit
											</p>
										</div>
									</div>

									{/* Qualifications */}
									<div className="flex items-start space-x-4">
										<div className="bg-red-100 p-3 rounded-full shrink-0">
											<GraduationCap className="h-6 w-6 text-red-500" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-800">
												Qualifications
											</h3>
											<p className="text-gray-600 text-sm">
												Bachelor&apos;s Degree with B.Ed or equivalent
											</p>
										</div>
									</div>

									{/* Experience */}
									<div className="flex items-start space-x-4">
										<div className="bg-red-100 p-3 rounded-full shrink-0">
											<Clock className="h-6 w-6 text-red-500" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-800">
												Experience
											</h3>
											<p className="text-gray-600 text-sm">
												Minimum 2 years of teaching experience
											</p>
										</div>
									</div>

									{/* Salary Range */}
									<div className="flex items-start space-x-4">
										<div className="bg-red-100 p-3 rounded-full shrink-0">
											<Users className="h-6 w-6 text-red-500" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-800">
												Salary Range
											</h3>
											<p className="text-gray-600 text-sm">
												₹15,000 - ₹25,000 per month
											</p>
										</div>
									</div>

									{/* Recruitment Poster Image */}
									<div
										className="rounded-lg shadow-md mt-6 cursor-pointer transform hover:scale-105 transition-transform duration-300 overflow-hidden"
										onClick={() => openModal("/recruitment.png")}
									>
										<Image
											src="/recruitment.png"
											alt="Teacher Recruitment Poster"
											width={500}
											height={600}
											className="w-full h-auto object-cover"
											priority
										/>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Application Form */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="bg-white rounded-xl shadow-lg overflow-hidden h-fit sticky top-4"
						>
							<div className="bg-linear-to-r from-gray-800 to-gray-700 p-6">
								<h2 className="text-2xl font-bold text-white flex items-center">
									<Briefcase className="mr-2" /> Application Form
								</h2>
								<p className="text-white/80 mt-2">
									Fill in your details to apply
								</p>
							</div>

							<form
								onSubmit={handleSubmit}
								className="p-6 space-y-6"
								key="teacher-application-form"
							>
								{/* Resume Upload Section */}
								<div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
									<h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
										<svg
											className="w-5 h-5 mr-2"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M8 16.5a1 1 0 11-2 0 1 1 0 012 0zM15 7H4v2h11V7zM4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
										</svg>
										Upload Your Resume
									</h3>
									<p className="text-sm text-blue-800 mb-3">
										Your resume is <span className="font-bold">required</span>{" "}
										to submit your application.
									</p>
									<ResumeUpload
										currentResume={formData.resumeUrl}
										onFileSelect={handleFileSelect}
									/>
								</div>
								{/* Personal Information */}
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<h3 className="text-lg font-bold text-gray-800 mb-4">
										Personal Information
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Full Name <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												required
												autoComplete="name"
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
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												required
											>
												<option value="">Select Gender</option>
												<option value="Male">Male</option>
												<option value="Female">Female</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Mobile Number <span className="text-red-500">*</span>
											</label>
											<input
												type="tel"
												name="mobileNumber"
												value={formData.mobileNumber}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												required
												autoComplete="tel"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Subject <span className="text-red-500">*</span>
											</label>
											<select
												name="subject"
												value={formData.subject}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												required
											>
												<option value="">Select Subject</option>
												<option value="Mathematics">Mathematics</option>
												<option value="Physics">Physics</option>
												<option value="Chemistry">Chemistry</option>
												<option value="Biology">Biology</option>
												<option value="Sanskrit">Sanskrit</option>
												<option value="Hindi">Hindi</option>
												<option value="English">English</option>
												<option value="Social Science">Social Science</option>
												<option value="Science">Science</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Class Preference <span className="text-red-500">*</span>
											</label>
											<select
												name="class"
												value={formData.class}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												required
											>
												<option value="">Select Class</option>
												<option value="Primary">Primary (1-5)</option>
												<option value="Middle">Middle (6-8)</option>
												<option value="Secondary">Secondary (9-10)</option>
												<option value="Higher Secondary">
													Higher Secondary (11-12)
												</option>
												<option value="Higher School">
													Higher School (9-12)
												</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Experience (Years){" "}
												<span className="text-red-500">*</span>
											</label>
											<input
												type="number"
												name="experience"
												value={formData.experience}
												onChange={handleChange}
												min="0"
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												required
											/>
										</div>
									</div>
								</div>

								{/* Educational Qualifications */}
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<h3 className="text-lg font-bold text-gray-800 mb-4">
										Educational Qualifications
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Highest Qualification{" "}
												<span className="text-red-500">*</span>
											</label>
											<select
												name="qualifications"
												value={formData.qualifications}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												required
											>
												<option value="">Select Highest Qualification</option>
												<option value="BA">BA</option>
												<option value="BSc">BSc</option>
												<option value="BCom">BCom</option>
												<option value="BCA">BCA</option>
												<option value="MA">MA</option>
												<option value="MSc">MSc</option>
												<option value="MCom">MCom</option>
												<option value="MCA">MCA</option>
												<option value="PhD">PhD</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Specialization <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												placeholder="e.g., Mathematics, Physics"
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												name="specialization"
												value={formData.specialization}
												onChange={handleChange}
												required
											/>
										</div>
									</div>
								</div>

								{/* Professional Qualifications */}
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<h3 className="text-lg font-bold text-gray-800 mb-4">
										Professional Qualifications
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Professional Qualification{" "}
												<span className="text-red-500">*</span>
											</label>
											<select
												name="professionalQualification"
												value={formData.professionalQualification}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
												required
											>
												<option value="">
													Select Professional Qualification
												</option>
												<option value="B.Ed">B.Ed</option>
												<option value="M.Ed">M.Ed</option>
												<option value="D.Ed">D.Ed</option>
												<option value="CTET">CTET</option>
												<option value="MPTET">MPTET</option>
												<option value="Other">Other</option>
											</select>
										</div>

										{formData.professionalQualification === "Other" && (
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Specify Other Qualification
												</label>
												<input
													type="text"
													placeholder="Specify Other Qualification"
													className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
													name="otherProfessionalQualification"
													value={formData.otherProfessionalQualification}
													onChange={handleChange}
												/>
											</div>
										)}
									</div>
								</div>

								{/* Address Information */}
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<h3 className="text-lg font-bold text-gray-800 mb-4">
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
											className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
											required
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												District <span className="text-red-500">*</span>
											</label>
											<select
												name="district"
												value={formData.district}
												onChange={handleChange}
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
												className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
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
									disabled={
										submitting || (!selectedFile && !formData.resumeUrl)
									}
									className={`w-full p-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition ${
										!submitting && (selectedFile || formData.resumeUrl)
											? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
											: "bg-gray-300 cursor-not-allowed text-gray-500"
									}`}
								>
									<Send className="w-5 h-5" />
									<span>
										{submitting
											? "Submitting..."
											: !selectedFile && !formData.resumeUrl
											? "Upload Resume First"
											: "Submit Application"}
									</span>
								</button>

								{/* Resume Required Notice */}
								{!selectedFile && !formData.resumeUrl && (
									<div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
										<p className="text-sm text-amber-800 flex items-center">
											<span className="mr-2">⚠️</span>
											Please upload your resume to proceed
										</p>
									</div>
								)}
							</form>
						</motion.div>
					</div>
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
};

export default Careers;
