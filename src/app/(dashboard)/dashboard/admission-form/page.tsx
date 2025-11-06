/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export default function AdmissionsTab() {
	const [forms, setForms] = useState<any[]>([]);
	const [selectedForm, setSelectedForm] = useState<any>(null);
	const [showModal, setShowModal] = useState(false);
	const [filterStatus, setFilterStatus] = useState<string>("All");
	const [statusNotes, setStatusNotes] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		loadForms();
	}, []);

	const loadForms = async () => {
		try {
			setLoading(true);
			const data = await apiClient.getAdmissionForms();
			setForms(data);
		} catch (error) {
			console.error("Error loading forms:", error);
		} finally {
			setLoading(false);
		}
	};

	const updateStatus = async (id: number, status: string, notes: string) => {
		try {
			setUpdating(true);
			await apiClient.updateAdmissionForm(id, { status, notes });
			setStatusNotes("");
			await loadForms();
		} catch (error) {
			console.error("Error updating form:", error);
			alert("Failed to update status");
		} finally {
			setUpdating(false);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			setDeleting(true);
			await fetch(`/api/admission-forms/${id}`, {
				method: "DELETE",
			});
			setShowModal(false);
			await loadForms();
		} catch (error) {
			console.error("Error deleting form:", error);
			alert("Failed to delete application");
		} finally {
			setDeleting(false);
		}
	};

	const viewDetails = (form: any) => {
		setSelectedForm(form);
		setStatusNotes(form.notes || "");
		setShowModal(true);
	};

	// Filter forms by status
	const filteredForms =
		filterStatus === "All"
			? forms
			: forms.filter((form) => form.status === filterStatus);

	// Status counts
	const statusCounts = {
		All: forms.length,
		New: forms.filter((f) => f.status === "New").length,
		Reviewed: forms.filter((f) => f.status === "Reviewed").length,
		Contacted: forms.filter((f) => f.status === "Contacted").length,
		Admitted: forms.filter((f) => f.status === "Admitted").length,
		Rejected: forms.filter((f) => f.status === "Rejected").length,
	};

	// Status badge colors
	const getStatusColor = (status: string) => {
		switch (status) {
			case "New":
				return "bg-blue-100 text-blue-800";
			case "Reviewed":
				return "bg-purple-100 text-purple-800";
			case "Contacted":
				return "bg-yellow-100 text-yellow-800";
			case "Admitted":
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
							Admission Management
						</h1>
						<p className="text-gray-600 mt-1 text-sm sm:text-base">
							Review and manage student applications
						</p>
					</div>
					<div className="text-center sm:text-right">
						<div className="text-2xl sm:text-3xl font-bold text-blue-600">
							{forms.length}
						</div>
						<div className="text-xs sm:text-sm text-gray-500">
							Total Applications
						</div>
					</div>
				</div>

				{/* Filter Pills */}
				<div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
					{["All", "New", "Reviewed", "Contacted", "Admitted", "Rejected"].map(
						(status) => (
							<button
								key={status}
								onClick={() => setFilterStatus(status)}
								className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
									filterStatus === status
										? "bg-blue-600 text-white shadow-md transform scale-105"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
								}`}
							>
								<span className="block sm:inline">{status}</span>
								<span className="block sm:inline text-xs">
									({statusCounts[status as keyof typeof statusCounts]})
								</span>
							</button>
						)
					)}
				</div>
			</div>

			{/* Table */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-8 sm:py-12">
						<div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
						<span className="ml-3 text-gray-600 text-sm sm:text-base">
							Loading applications...
						</span>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Student Details
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Contact
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Location
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
								{filteredForms.map((form) => (
									<tr
										key={form.id}
										className="hover:bg-gray-50 transition-colors duration-150"
									>
										<td className="px-6 py-4">
											<div className="flex items-start space-x-3">
												<div className="flex-shrink-0">
													<div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
														<span className="text-white font-semibold text-sm">
															{form.studentName.charAt(0).toUpperCase()}
														</span>
													</div>
												</div>
												<div>
													<div className="font-semibold text-gray-900">
														{form.studentName}
													</div>
													<div className="text-sm text-gray-500">
														Class {form.class} • {form.gender}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm">
												<div className="font-medium text-gray-900">
													{form.mobileNumber}
												</div>
												{form.alternateMobile && (
													<div className="text-gray-500">
														{form.alternateMobile}
													</div>
												)}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm">
												<div className="font-medium text-gray-900">
													{form.district}
												</div>
												<div className="text-gray-500">{form.block}</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
													form.status
												)}`}
											>
												{form.status}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{new Date(form.createdAt).toLocaleDateString("en-IN", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() => viewDetails(form)}
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
															handleDelete(form.id);
														}
													}}
													className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{filteredForms.length === 0 && !loading && (
					<div className="text-center py-12 sm:py-16 px-4">
						<div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4">
							<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-3.586a1 1 0 00-.707.293l-5.414-5.414a1 1 0 00-.293-.707V5"
								/>
							</svg>
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
							No applications found
						</h3>
						<p className="text-gray-600 text-sm sm:text-base">
							{filterStatus === "All"
								? "Applications will appear here when students submit their forms."
								: `No applications with status "${filterStatus}" found.`}
						</p>
					</div>
				)}
			</div>

			{/* Enhanced Modal */}
			{showModal && selectedForm && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
					<div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col mx-2">
						{/* Modal Header */}
						<div className="bg-linear-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 shrink-0">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3 min-w-0">
									<div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
										<span className="text-white font-semibold">
											{selectedForm.studentName.charAt(0).toUpperCase()}
										</span>
									</div>
									<div className="min-w-0">
										<h2 className="text-lg sm:text-xl font-bold text-white truncate">
											{selectedForm.studentName}
										</h2>
										<p className="text-blue-100 text-xs sm:text-sm">
											Application Details
										</p>
									</div>
								</div>
								<button
									onClick={() => setShowModal(false)}
									className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
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
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
									{/* Status Management */}
									<div className="lg:col-span-1">
										<div className="bg-gray-50 rounded-xl p-4 space-y-4">
											<h4 className="font-semibold text-gray-900 flex items-center">
												<svg
													className="w-5 h-5 mr-2 text-blue-600"
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
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Current Status
												</label>
												<select
													value={selectedForm.status}
													onChange={(e) =>
														setSelectedForm({
															...selectedForm,
															status: e.target.value,
														})
													}
													className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
												>
													<option value="New">New</option>
													<option value="Reviewed">Reviewed</option>
													<option value="Contacted">Contacted</option>
													<option value="Admitted">Admitted</option>
													<option value="Rejected">Rejected</option>
												</select>
												<div className="mt-3">
													<span
														className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
															selectedForm.status
														)}`}
													>
														{selectedForm.status}
													</span>
												</div>
											</div>
										</div>

										{/* Admin Notes */}
										<div className="bg-yellow-50 rounded-xl p-4 mt-4">
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
														d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
													/>
												</svg>
												Admin Notes
											</h4>
											<textarea
												value={statusNotes}
												onChange={(e) => setStatusNotes(e.target.value)}
												className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
												rows={4}
												placeholder="Add notes about this application..."
											/>
										</div>
									</div>

									{/* Application Details */}
									<div className="lg:col-span-2 space-y-6">
										{/* Student Information */}
										<div className="bg-white border border-gray-200 rounded-xl p-4">
											<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
												<svg
													className="w-5 h-5 mr-2 text-green-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
													/>
												</svg>
												Student Information
											</h4>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Student Name
													</p>
													<p className="text-gray-900">
														{selectedForm.studentName}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Gender
													</p>
													<p className="text-gray-900">{selectedForm.gender}</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Date of Birth
													</p>
													<p className="text-gray-900">
														{new Date(
															selectedForm.dateOfBirth
														).toLocaleDateString("en-IN")}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Class
													</p>
													<p className="text-gray-900">{selectedForm.class}</p>
												</div>
											</div>
										</div>

										{/* Parent Information */}
										<div className="bg-white border border-gray-200 rounded-xl p-4">
											<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
												<svg
													className="w-5 h-5 mr-2 text-purple-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
													/>
												</svg>
												Parent Information
											</h4>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Father's Name
													</p>
													<p className="text-gray-900">
														{selectedForm.fatherName}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Mother's Name
													</p>
													<p className="text-gray-900">
														{selectedForm.motherName}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Mobile Number
													</p>
													<p className="text-gray-900">
														{selectedForm.mobileNumber}
													</p>
												</div>
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Alternate Mobile
													</p>
													<p className="text-gray-900">
														{selectedForm.alternateMobile || "—"}
													</p>
												</div>
											</div>
										</div>

										{/* Location & Other Details */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="bg-white border border-gray-200 rounded-xl p-4">
												<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
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
															d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
														/>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
														/>
													</svg>
													Location
												</h4>
												<div className="space-y-3">
													<div>
														<p className="text-sm font-medium text-gray-500">
															District
														</p>
														<p className="text-gray-900">
															{selectedForm.district}
														</p>
													</div>
													<div>
														<p className="text-sm font-medium text-gray-500">
															Block
														</p>
														<p className="text-gray-900">
															{selectedForm.block}
														</p>
													</div>
													<div>
														<p className="text-sm font-medium text-gray-500">
															Address
														</p>
														<p className="text-gray-900">
															{selectedForm.address}
														</p>
													</div>
												</div>
											</div>

											<div className="bg-white border border-gray-200 rounded-xl p-4">
												<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
													<svg
														className="w-5 h-5 mr-2 text-indigo-600"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
														/>
													</svg>
													Previous School
												</h4>
												<p className="text-gray-900">
													{selectedForm.previousSchool || "Not specified"}
												</p>
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
										handleDelete(selectedForm.id);
									}
								}}
								disabled={deleting}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center text-sm sm:text-base"
							>
								{deleting && (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								)}
								Delete Application
							</button>
							<button
								onClick={() => {
									updateStatus(
										selectedForm.id,
										selectedForm.status,
										statusNotes
									);
									setShowModal(false);
								}}
								disabled={updating}
								className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center text-sm sm:text-base"
							>
								{updating && (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								)}
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
