/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { deleteCloudinaryFile } from "@/lib/cloudinary-helper";
import { motion, AnimatePresence } from "framer-motion";
import {
	Eye,
	Trash2,
	FileText,
	ChevronRight,
	Download,
	ExternalLink,
	User,
	BookOpen,
	MapPin,
	Award,
	Phone,
	Calendar,
} from "lucide-react";

export default function TeachersTab() {
	const [applications, setApplications] = useState<any[]>([]);
	const [selectedApp, setSelectedApp] = useState<any>(null);
	const [showModal, setShowModal] = useState(false);
	const [showPDFModal, setShowPDFModal] = useState(false);
	const [selectedPDF, setSelectedPDF] = useState<string | null>(null);
	const [filterStatus, setFilterStatus] = useState<string>("All");
	const [statusNotes, setStatusNotes] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		loadApplications();
	}, []);

	const loadApplications = async () => {
		try {
			setLoading(true);
			const data = await apiClient.getTeacherApplications();
			setApplications(data);
		} catch (error) {
			console.error("Error loading applications:", error);
		} finally {
			setLoading(false);
		}
	};

	const updateStatus = async (id: number, status: string, notes: string) => {
		try {
			setUpdating(true);
			await apiClient.updateTeacherApplication(id, { status, notes });
			await loadApplications();
			setStatusNotes("");
		} catch (error) {
			console.error("Error updating application:", error);
			alert("Failed to update status. Please try again.");
		} finally {
			setUpdating(false);
		}
	};

	const handleDelete = async (id: number) => {
		const app = applications.find((a) => a.id === id);

		try {
			setDeleting(true);
			await fetch(`/api/teacher-applications/${id}`, {
				method: "DELETE",
			});

			if (app?.resumeUrl) {
				const deleted = await deleteCloudinaryFile(app.resumeUrl);
				if (!deleted) {
					console.warn("Database entry deleted but resume deletion failed");
				}
			}

			setShowModal(false);
			await loadApplications();
		} catch (error) {
			console.error("Error deleting application:", error);
			alert("Failed to delete application");
		} finally {
			setDeleting(false);
		}
	};

	const viewDetails = (app: any) => {
		setSelectedApp(app);
		setStatusNotes(app.notes || "");
		setShowModal(true);
	};

	const openPDF = (pdfUrl: string) => {
		setSelectedPDF(pdfUrl);
		setShowPDFModal(true);
	};

	// Filter applications by status
	const filteredApps =
		filterStatus === "All"
			? applications
			: applications.filter((app) => app.status === filterStatus);

	// Status counts
	const statusCounts = {
		All: applications.length,
		New: applications.filter((a) => a.status === "New").length,
		Shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
		"Interview Scheduled": applications.filter(
			(a) => a.status === "Interview Scheduled"
		).length,
		Hired: applications.filter((a) => a.status === "Hired").length,
		Rejected: applications.filter((a) => a.status === "Rejected").length,
	};

	// Status badge colors
	const getStatusColor = (status: string) => {
		switch (status) {
			case "New":
				return "bg-blue-100 text-blue-800";
			case "Shortlisted":
				return "bg-purple-100 text-purple-800";
			case "Interview Scheduled":
				return "bg-yellow-100 text-yellow-800";
			case "Hired":
				return "bg-green-100 text-green-800";
			case "Rejected":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
							Teacher Recruitment
						</h1>
						<p className="text-gray-600 mt-1 text-sm sm:text-base">
							Manage and review all teacher applications
						</p>
					</div>
					<div className="text-center sm:text-right">
						<div className="text-2xl sm:text-3xl font-bold text-red-600">
							{applications.length}
						</div>
						<div className="text-xs sm:text-sm text-gray-500">
							Total Applications
						</div>
					</div>
				</div>

				{/* Filter Pills */}
				<div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3">
					{[
						"All",
						"New",
						"Shortlisted",
						"Interview Scheduled",
						"Hired",
						"Rejected",
					].map((status) => (
						<motion.button
							key={status}
							onClick={() => setFilterStatus(status)}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
								filterStatus === status
									? "bg-red-600 text-white shadow-md transform scale-105"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
							}`}
						>
							<span className="block sm:inline">{status}</span>
							<span className="block sm:inline text-xs">
								({statusCounts[status as keyof typeof statusCounts]})
							</span>
						</motion.button>
					))}
				</div>
			</div>

			{/* Table Container */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-8 sm:py-12">
						<div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-red-600"></div>
						<span className="ml-3 text-gray-600 text-sm sm:text-base">
							Loading applications...
						</span>
					</div>
				) : (
					<>
						{/* Desktop Table View */}
						<div className="hidden lg:block overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Teacher Details
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Subject & Experience
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Contact
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Location
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Resume
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Applied Date
										</th>
										<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									<AnimatePresence>
										{filteredApps.map((app) => (
											<motion.tr
												key={app.id}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className="hover:bg-gray-50 transition-colors duration-150"
											>
												<td className="px-6 py-4">
													<div className="flex items-start space-x-3">
														<div className="flex-shrink-0">
															<div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
																<span className="text-white font-semibold text-sm">
																	{app.name.charAt(0).toUpperCase()}
																</span>
															</div>
														</div>
														<div>
															<div className="font-semibold text-gray-900">
																{app.name}
															</div>
															<div className="text-sm text-gray-500">
																{app.gender}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4">
													<div className="text-sm">
														<div className="font-medium text-gray-900">
															{app.subject}
														</div>
														<div className="text-gray-500">
															Class {app.class} • {app.experience} yrs
														</div>
													</div>
												</td>
												<td className="px-6 py-4 text-sm text-gray-900">
													{app.mobileNumber}
												</td>
												<td className="px-6 py-4">
													<div className="text-sm">
														<div className="font-medium text-gray-900">
															{app.district}
														</div>
														<div className="text-gray-500">{app.block}</div>
													</div>
												</td>
												<td className="px-6 py-4">
													{app.resumeUrl ? (
														<button
															onClick={() => openPDF(app.resumeUrl)}
															className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-150"
														>
															<FileText size={16} />
															View
														</button>
													) : (
														<span className="text-gray-400 text-sm">—</span>
													)}
												</td>
												<td className="px-6 py-4">
													<span
														className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
															app.status
														)}`}
													>
														{app.status}
													</span>
												</td>
												<td className="px-6 py-4 text-sm text-gray-900">
													{new Date(app.createdAt).toLocaleDateString("en-IN", {
														year: "numeric",
														month: "short",
														day: "numeric",
													})}
												</td>
												<td className="px-6 py-4 text-right">
													<div className="flex justify-end space-x-2">
														<button
															onClick={() => viewDetails(app)}
															className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-150"
														>
															View Details
														</button>
														<button
															onClick={() => {
																if (
																	confirm(
																		"Are you sure you want to delete this application?"
																	)
																) {
																	handleDelete(app.id);
																}
															}}
															className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150"
														>
															Delete
														</button>
													</div>
												</td>
											</motion.tr>
										))}
									</AnimatePresence>
								</tbody>
							</table>
						</div>

						{/* Mobile Card View */}
						<div className="lg:hidden divide-y divide-gray-200">
							<AnimatePresence>
								{filteredApps.map((app) => (
									<motion.div
										key={app.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="p-4 hover:bg-gray-50 transition-colors"
									>
										<div className="space-y-3">
											<div className="flex items-start justify-between">
												<div className="flex items-start space-x-3">
													<div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0">
														<span className="text-white font-semibold text-sm">
															{app.name.charAt(0).toUpperCase()}
														</span>
													</div>
													<div>
														<h3 className="font-semibold text-gray-900">
															{app.name}
														</h3>
														<p className="text-sm text-gray-500">
															{app.gender}
														</p>
													</div>
												</div>
												<span
													className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
														app.status
													)}`}
												>
													{app.status}
												</span>
											</div>

											<div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-200">
												<div>
													<p className="text-xs text-gray-500 font-medium">
														Subject
													</p>
													<p className="font-medium text-gray-900">
														{app.subject}
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-500 font-medium">
														Experience
													</p>
													<p className="font-medium text-gray-900">
														{app.experience} years
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-500 font-medium">
														Mobile
													</p>
													<p className="font-medium text-gray-900">
														{app.mobileNumber}
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-500 font-medium">
														Location
													</p>
													<p className="font-medium text-gray-900">
														{app.district}
													</p>
												</div>
											</div>

											<div className="flex items-center justify-between text-sm">
												<p className="text-gray-600">
													Applied:{" "}
													<span className="font-medium">
														{new Date(app.createdAt).toLocaleDateString(
															"en-IN"
														)}
													</span>
												</p>
												{app.resumeUrl && (
													<button
														onClick={() => openPDF(app.resumeUrl)}
														className="text-green-600 font-medium hover:text-green-700 flex items-center gap-1"
													>
														<FileText size={16} />
														Resume
													</button>
												)}
											</div>

											<div className="flex gap-2 pt-2">
												<motion.button
													whileTap={{ scale: 0.95 }}
													onClick={() => viewDetails(app)}
													className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium text-sm transition-colors"
												>
													<Eye size={16} />
													View Details
												</motion.button>
												<motion.button
													whileTap={{ scale: 0.95 }}
													onClick={() => {
														if (confirm("Delete this application?")) {
															handleDelete(app.id);
														}
													}}
													className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium text-sm transition-colors"
												>
													<Trash2 size={16} />
												</motion.button>
											</div>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</>
				)}

				{filteredApps.length === 0 && !loading && (
					<div className="text-center py-12 sm:py-16 px-4">
						<div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
							No applications found
						</h3>
						<p className="text-gray-600 text-sm sm:text-base">
							{filterStatus === "All"
								? "Applications will appear here when teachers submit their forms."
								: `No applications with status "${filterStatus}" found.`}
						</p>
					</div>
				)}
			</div>

			{/* Enhanced Details Modal */}
			<AnimatePresence>
				{showModal && selectedApp && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-2"
						>
							{/* Modal Header */}
							<div className="bg-linear-to-r from-red-600 to-red-700 px-4 sm:px-6 py-4 shrink-0">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
											<span className="text-white font-semibold">
												{selectedApp.name.charAt(0).toUpperCase()}
											</span>
										</div>
										<div>
											<h3 className="text-xl font-semibold text-white">
												{selectedApp.name}
											</h3>
											<p className="text-red-100 text-sm">
												Teacher Application Details
											</p>
										</div>
									</div>
									<button
										onClick={() => setShowModal(false)}
										className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>

							{/* Modal Content */}
							<div className="flex-1 overflow-y-auto">
								<div className="p-4 sm:p-6">
									<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
										{/* Status Management */}
										<div className="lg:col-span-1 space-y-6">
											<div className="bg-gray-50 rounded-xl p-4">
												<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
													<svg
														className="w-5 h-5 mr-2 text-red-600"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													Status Management
												</h4>
												<div className="space-y-3">
													<select
														value={selectedApp.status}
														onChange={(e) =>
															setSelectedApp({
																...selectedApp,
																status: e.target.value,
															})
														}
														className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
													>
														<option value="New">New</option>
														<option value="Shortlisted">Shortlisted</option>
														<option value="Interview Scheduled">
															Interview Scheduled
														</option>
														<option value="Hired">Hired</option>
														<option value="Rejected">Rejected</option>
													</select>
													<span
														className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
															selectedApp.status
														)}`}
													>
														{selectedApp.status}
													</span>
												</div>
											</div>

											{/* Resume Section */}
											{selectedApp.resumeUrl && (
												<div className="bg-green-50 rounded-xl p-4">
													<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
														<FileText className="w-5 h-5 mr-2 text-green-600" />
														Resume
													</h4>
													<div className="space-y-2">
														<button
															onClick={() => openPDF(selectedApp.resumeUrl)}
															className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-sm transition-colors"
														>
															<Eye size={16} />
															View Resume
														</button>
														<a
															href={selectedApp.resumeUrl}
															download="resume.pdf"
															className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm transition-colors"
														>
															<Download size={16} />
															Download
														</a>
													</div>
												</div>
											)}

											{/* Admin Notes */}
											<div className="bg-yellow-50 rounded-xl p-4">
												<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
													<svg
														className="w-5 h-5 mr-2 text-yellow-600"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
														/>
													</svg>
													Admin Notes
												</h4>
												<textarea
													value={statusNotes}
													onChange={(e) => setStatusNotes(e.target.value)}
													className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
													rows={4}
													placeholder="Add notes about this application..."
												/>
											</div>
										</div>

										{/* Application Details */}
										<div className="lg:col-span-2 space-y-6">
											{/* Personal Information */}
											<div className="bg-white border border-gray-200 rounded-xl p-4">
												<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
													<User className="w-5 h-5 mr-2 text-blue-600" />
													Personal Information
												</h4>
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-1">
														<p className="text-sm font-medium text-gray-500">
															Name
														</p>
														<p className="text-gray-900">{selectedApp.name}</p>
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium text-gray-500">
															Gender
														</p>
														<p className="text-gray-900">
															{selectedApp.gender}
														</p>
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium text-gray-500">
															Mobile Number
														</p>
														<p className="text-gray-900">
															{selectedApp.mobileNumber}
														</p>
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium text-gray-500">
															Experience
														</p>
														<p className="text-gray-900">
															{selectedApp.experience} years
														</p>
													</div>
												</div>
											</div>

											{/* Professional Information */}
											<div className="bg-white border border-gray-200 rounded-xl p-4">
												<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
													<BookOpen className="w-5 h-5 mr-2 text-purple-600" />
													Professional Information
												</h4>
												<div className="space-y-4">
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-1">
															<p className="text-sm font-medium text-gray-500">
																Subject
															</p>
															<p className="text-gray-900">
																{selectedApp.subject}
															</p>
														</div>
														<div className="space-y-1">
															<p className="text-sm font-medium text-gray-500">
																Class
															</p>
															<p className="text-gray-900">
																{selectedApp.class}
															</p>
														</div>
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium text-gray-500">
															Qualifications
														</p>
														<p className="text-gray-900">
															{selectedApp.qualifications}
														</p>
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium text-gray-500">
															Specialization
														</p>
														<p className="text-gray-900">
															{selectedApp.specialization}
														</p>
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium text-gray-500">
															Professional Qualification
														</p>
														<p className="text-gray-900">
															{selectedApp.professionalQualification}
														</p>
													</div>
													{selectedApp.otherProfessionalQualification && (
														<div className="space-y-1">
															<p className="text-sm font-medium text-gray-500">
																Other Professional Qualification
															</p>
															<p className="text-gray-900">
																{selectedApp.otherProfessionalQualification}
															</p>
														</div>
													)}
												</div>
											</div>

											{/* Location Information */}
											<div className="bg-white border border-gray-200 rounded-xl p-4">
												<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
													<MapPin className="w-5 h-5 mr-2 text-green-600" />
													Location Information
												</h4>
												<div className="space-y-3">
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-1">
															<p className="text-sm font-medium text-gray-500">
																District
															</p>
															<p className="text-gray-900">
																{selectedApp.district}
															</p>
														</div>
														<div className="space-y-1">
															<p className="text-sm font-medium text-gray-500">
																Block
															</p>
															<p className="text-gray-900">
																{selectedApp.block}
															</p>
														</div>
													</div>
													<div className="space-y-1">
														<p className="text-sm font-medium text-gray-500">
															Address
														</p>
														<p className="text-gray-900">
															{selectedApp.address}
														</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end border-t border-gray-200 shrink-0">
								<button
									onClick={() => setShowModal(false)}
									className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm sm:text-base"
								>
									Close
								</button>
								<button
									onClick={() => {
										if (
											confirm(
												"Are you sure you want to delete this application? This action cannot be undone."
											)
										) {
											handleDelete(selectedApp.id);
										}
									}}
									disabled={deleting}
									className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
								>
									{deleting && (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									)}
									Delete Application
								</button>
								<button
									onClick={() => {
										updateStatus(
											selectedApp.id,
											selectedApp.status,
											statusNotes
										);
										setShowModal(false);
									}}
									disabled={updating}
									className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center"
								>
									{updating && (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									)}
									Save Changes
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Enhanced PDF Viewer Modal */}
			<AnimatePresence>
				{showPDFModal && selectedPDF && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="bg-white rounded-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden mx-2"
						>
							{/* PDF Header */}
							<div className="bg-linear-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 border-b shrink-0">
								<div className="flex justify-between items-center">
									<h3 className="text-lg font-semibold text-gray-900 flex items-center">
										<FileText className="w-5 h-5 mr-2 text-green-600" />
										Resume Viewer
									</h3>
									<button
										onClick={() => setShowPDFModal(false)}
										className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>

							{/* PDF Viewer */}
							<div className="flex-1 bg-gray-100">
								<iframe
									src={`${selectedPDF}#toolbar=1&navpanes=0`}
									className="w-full h-full border-none"
									title="Resume PDF"
								/>
							</div>

							{/* Footer */}
							<div className="bg-gray-50 px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center shrink-0">
								<p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
									Use the toolbar above to navigate and zoom
								</p>
								<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
									<a
										href={selectedPDF}
										download="resume.pdf"
										className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs sm:text-sm transition-colors"
									>
										<Download size={14} className="sm:w-4 sm:h-4" />
										Download
									</a>
									<a
										href={selectedPDF}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs sm:text-sm transition-colors"
									>
										<ExternalLink size={14} className="sm:w-4 sm:h-4" />
										Open in New Tab
									</a>
									<button
										onClick={() => setShowPDFModal(false)}
										className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-xs sm:text-sm transition-colors"
									>
										Close
									</button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
