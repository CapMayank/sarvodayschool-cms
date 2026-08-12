/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { deleteCloudinaryFile } from "@/lib/cloudinary-helper";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
	Eye,
	Trash2,
	FileText,
	Download,
	ExternalLink,
	User,
	BookOpen,
	MapPin,
} from "lucide-react";

export default function TeachersTab() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [applications, setApplications] = useState<any[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
				return "bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100";
			case "Shortlisted":
				return "bg-purple-100 text-purple-800 border-transparent hover:bg-purple-100";
			case "Interview Scheduled":
				return "bg-yellow-100 text-yellow-800 border-transparent hover:bg-yellow-100";
			case "Hired":
				return "bg-green-100 text-green-800 border-transparent hover:bg-green-100";
			case "Rejected":
				return "bg-red-100 text-red-800 border-transparent hover:bg-red-100";
			default:
				return "bg-gray-100 text-gray-800 border-transparent hover:bg-gray-100";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">Teacher Recruitment</CardTitle>
						<CardDescription>
							Manage and review all teacher applications
						</CardDescription>
					</div>
					<div className="text-center sm:text-right">
						<div className="text-2xl font-bold text-red-600">
							{applications.length}
						</div>
						<div className="text-xs text-muted-foreground">
							Total Applications
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Filter Pills */}
					<div className="flex flex-wrap gap-2">
						{[
							"All",
							"New",
							"Shortlisted",
							"Interview Scheduled",
							"Hired",
							"Rejected",
						].map((status) => (
							<Button
								key={status}
								variant={filterStatus === status ? "default" : "outline"}
								onClick={() => setFilterStatus(status)}
								className={filterStatus === status ? "bg-red-600 text-white hover:bg-red-700" : ""}
							>
								{status}
								<span className="ml-2 opacity-70">
									({statusCounts[status as keyof typeof statusCounts]})
								</span>
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Table Container */}
			<Card>
				<CardContent className="p-0">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
							<span className="ml-3 text-muted-foreground">
								Loading applications...
							</span>
						</div>
					) : (
						<>
							{/* Desktop Table View */}
							<div className="hidden lg:block overflow-x-auto">
								<table className="w-full">
									<thead className="bg-muted/50 border-b">
										<tr>
											<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Teacher Details
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Subject & Experience
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Contact
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Location
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Resume
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Status
											</th>
											<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Applied Date
											</th>
											<th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-background divide-y divide-border">
										<AnimatePresence>
											{filteredApps.map((app) => (
												<motion.tr
													key={app.id}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													className="hover:bg-muted/50 transition-colors"
												>
													<td className="px-6 py-4">
														<div className="flex items-start space-x-3">
															<div className="flex-shrink-0">
																<div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
																	<span className="font-semibold text-sm">
																		{app.name.charAt(0).toUpperCase()}
																	</span>
																</div>
															</div>
															<div>
																<div className="font-semibold text-foreground">
																	{app.name}
																</div>
																<div className="text-sm text-muted-foreground">
																	{app.gender}
																</div>
															</div>
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="text-sm">
															<div className="font-medium text-foreground">
																{app.subject}
															</div>
															<div className="text-muted-foreground">
																Class {app.class} • {app.experience} yrs
															</div>
														</div>
													</td>
													<td className="px-6 py-4 text-sm text-foreground">
														{app.mobileNumber}
													</td>
													<td className="px-6 py-4">
														<div className="text-sm">
															<div className="font-medium text-foreground">
																{app.district}
															</div>
															<div className="text-muted-foreground">{app.block}</div>
														</div>
													</td>
													<td className="px-6 py-4">
														{app.resumeUrl ? (
															<Button
																variant="outline"
																size="sm"
																onClick={() => openPDF(app.resumeUrl)}
																className="text-green-600 hover:text-green-700 hover:bg-green-50"
															>
																<FileText size={16} className="mr-2" />
																View
															</Button>
														) : (
															<span className="text-muted-foreground text-sm">—</span>
														)}
													</td>
													<td className="px-6 py-4">
														<Badge variant="outline" className={getStatusColor(app.status)}>
															{app.status}
														</Badge>
													</td>
													<td className="px-6 py-4 text-sm text-foreground">
														{new Date(app.createdAt).toLocaleDateString("en-IN", {
															year: "numeric",
															month: "short",
															day: "numeric",
														})}
													</td>
													<td className="px-6 py-4 text-right">
														<div className="flex justify-end space-x-2">
															<Button
																variant="outline"
																size="sm"
																className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
																onClick={() => viewDetails(app)}
															>
																View Details
															</Button>
															<Button
																variant="outline"
																size="sm"
																className="text-red-600 hover:text-red-700 hover:bg-red-50"
																onClick={() => {
																	if (confirm("Are you sure you want to delete this application?")) {
																		handleDelete(app.id);
																	}
																}}
															>
																Delete
															</Button>
														</div>
													</td>
												</motion.tr>
											))}
										</AnimatePresence>
									</tbody>
								</table>
							</div>

							{/* Mobile Card View */}
							<div className="lg:hidden divide-y divide-border">
								<AnimatePresence>
									{filteredApps.map((app) => (
										<motion.div
											key={app.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="p-4 hover:bg-muted/50 transition-colors"
										>
											<div className="space-y-3">
												<div className="flex items-start justify-between">
													<div className="flex items-start space-x-3">
														<div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
															<span className="font-semibold text-sm">
																{app.name.charAt(0).toUpperCase()}
															</span>
														</div>
														<div>
															<h3 className="font-semibold text-foreground">
																{app.name}
															</h3>
															<p className="text-sm text-muted-foreground">
																{app.gender}
															</p>
														</div>
													</div>
													<Badge variant="outline" className={getStatusColor(app.status)}>
														{app.status}
													</Badge>
												</div>

												<div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
													<div>
														<p className="text-xs text-muted-foreground font-medium">
															Subject
														</p>
														<p className="font-medium text-foreground">
															{app.subject}
														</p>
													</div>
													<div>
														<p className="text-xs text-muted-foreground font-medium">
															Experience
														</p>
														<p className="font-medium text-foreground">
															{app.experience} years
														</p>
													</div>
													<div>
														<p className="text-xs text-muted-foreground font-medium">
															Mobile
														</p>
														<p className="font-medium text-foreground">
															{app.mobileNumber}
														</p>
													</div>
													<div>
														<p className="text-xs text-muted-foreground font-medium">
															Location
														</p>
														<p className="font-medium text-foreground">
															{app.district}
														</p>
													</div>
												</div>

												<div className="flex items-center justify-between text-sm">
													<p className="text-muted-foreground">
														Applied:{" "}
														<span className="font-medium text-foreground">
															{new Date(app.createdAt).toLocaleDateString(
																"en-IN"
															)}
														</span>
													</p>
													{app.resumeUrl && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => openPDF(app.resumeUrl)}
															className="text-green-600 font-medium hover:text-green-700 hover:bg-green-50"
														>
															<FileText size={16} className="mr-2" />
															Resume
														</Button>
													)}
												</div>

												<div className="flex gap-2 pt-2">
													<Button
														onClick={() => viewDetails(app)}
														className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
													>
														<Eye size={16} className="mr-2" />
														View Details
													</Button>
													<Button
														onClick={() => {
															if (confirm("Delete this application?")) {
																handleDelete(app.id);
															}
														}}
														className="bg-red-100 text-red-700 hover:bg-red-200"
													>
														<Trash2 size={16} />
													</Button>
												</div>
											</div>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						</>
					)}

					{filteredApps.length === 0 && !loading && (
						<div className="text-center py-16 px-4">
							<div className="mx-auto h-16 w-16 text-muted-foreground mb-4 flex items-center justify-center">
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-10 h-10 opacity-50">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No applications found
							</h3>
							<p className="text-muted-foreground">
								{filterStatus === "All"
									? "Applications will appear here when teachers submit their forms."
									: `No applications with status "${filterStatus}" found.`}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Enhanced Details Modal -> Sheet */}
			<Sheet open={showModal} onOpenChange={(open) => {
				if (!open) setShowModal(false);
			}}>
				<SheetContent className="w-full sm:max-w-3xl overflow-y-auto" side="right">
					<SheetHeader className="mb-6 mt-4">
						<SheetTitle className="text-2xl flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
								<span className="font-bold">
									{selectedApp?.name?.charAt(0).toUpperCase()}
								</span>
							</div>
							<div className="text-left">
								<div>{selectedApp?.name}</div>
								<div className="text-sm text-muted-foreground font-normal">
									Teacher Application Details
								</div>
							</div>
						</SheetTitle>
						<SheetDescription></SheetDescription>
					</SheetHeader>

					{selectedApp && (
						<div className="space-y-6 pb-20">
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* Left Column */}
								<div className="lg:col-span-1 space-y-6">
									{/* Status Management */}
									<div className="bg-muted/50 rounded-lg p-4 border">
										<h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
											Status Management
										</h4>
										<div className="space-y-4">
											<select
												value={selectedApp.status}
												onChange={(e) =>
													setSelectedApp({
														...selectedApp,
														status: e.target.value,
													})
												}
												className="w-full p-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
											>
												<option value="New">New</option>
												<option value="Shortlisted">Shortlisted</option>
												<option value="Interview Scheduled">Interview Scheduled</option>
												<option value="Hired">Hired</option>
												<option value="Rejected">Rejected</option>
											</select>
											<div>
												<Badge variant="outline" className={getStatusColor(selectedApp.status)}>
													{selectedApp.status}
												</Badge>
											</div>
										</div>
									</div>

									{/* Resume Section */}
									{selectedApp.resumeUrl && (
										<div className="bg-green-50 rounded-lg p-4 border border-green-100">
											<h4 className="font-semibold text-green-900 mb-3 flex items-center">
												<FileText className="w-5 h-5 mr-2" />
												Resume
											</h4>
											<div className="space-y-2">
												<Button
													variant="outline"
													className="w-full text-green-700 border-green-200 hover:bg-green-100 bg-white"
													onClick={() => openPDF(selectedApp.resumeUrl)}
												>
													<Eye size={16} className="mr-2" />
													View Resume
												</Button>
												<Button
													variant="outline"
													className="w-full text-blue-700 border-blue-200 hover:bg-blue-100 bg-white"
													asChild
												>
													<a href={selectedApp.resumeUrl} download="resume.pdf">
														<Download size={16} className="mr-2" />
														Download
													</a>
												</Button>
											</div>
										</div>
									)}

									{/* Admin Notes */}
									<div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
										<h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
											Admin Notes
										</h4>
										<Textarea
											value={statusNotes}
											onChange={(e) => setStatusNotes(e.target.value)}
											className="resize-none bg-white border-yellow-200 focus-visible:ring-yellow-400"
											rows={4}
											placeholder="Add notes about this application..."
										/>
									</div>
								</div>

								{/* Right Column (Details) */}
								<div className="lg:col-span-2 space-y-6">
									{/* Personal Information */}
									<div className="bg-background border rounded-lg p-4 shadow-sm">
										<h4 className="font-semibold text-foreground mb-4 flex items-center">
											<User className="w-5 h-5 mr-2 text-blue-600" />
											Personal Information
										</h4>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-sm font-medium text-muted-foreground">Name</p>
												<p className="text-foreground font-medium">{selectedApp.name}</p>
											</div>
											<div>
												<p className="text-sm font-medium text-muted-foreground">Gender</p>
												<p className="text-foreground font-medium">{selectedApp.gender}</p>
											</div>
											<div>
												<p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
												<p className="text-foreground font-medium">{selectedApp.mobileNumber}</p>
											</div>
											<div>
												<p className="text-sm font-medium text-muted-foreground">Experience</p>
												<p className="text-foreground font-medium">{selectedApp.experience} years</p>
											</div>
										</div>
									</div>

									{/* Professional Information */}
									<div className="bg-background border rounded-lg p-4 shadow-sm">
										<h4 className="font-semibold text-foreground mb-4 flex items-center">
											<BookOpen className="w-5 h-5 mr-2 text-purple-600" />
											Professional Information
										</h4>
										<div className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<p className="text-sm font-medium text-muted-foreground">Subject</p>
													<p className="text-foreground font-medium">{selectedApp.subject}</p>
												</div>
												<div>
													<p className="text-sm font-medium text-muted-foreground">Class</p>
													<p className="text-foreground font-medium">{selectedApp.class}</p>
												</div>
											</div>
											<div>
												<p className="text-sm font-medium text-muted-foreground">Qualifications</p>
												<p className="text-foreground font-medium">{selectedApp.qualifications}</p>
											</div>
											<div>
												<p className="text-sm font-medium text-muted-foreground">Specialization</p>
												<p className="text-foreground font-medium">{selectedApp.specialization}</p>
											</div>
											<div>
												<p className="text-sm font-medium text-muted-foreground">Professional Qualification</p>
												<p className="text-foreground font-medium">{selectedApp.professionalQualification}</p>
											</div>
											{selectedApp.otherProfessionalQualification && (
												<div>
													<p className="text-sm font-medium text-muted-foreground">Other Professional Qualification</p>
													<p className="text-foreground font-medium">{selectedApp.otherProfessionalQualification}</p>
												</div>
											)}
										</div>
									</div>

									{/* Location Information */}
									<div className="bg-background border rounded-lg p-4 shadow-sm">
										<h4 className="font-semibold text-foreground mb-4 flex items-center">
											<MapPin className="w-5 h-5 mr-2 text-green-600" />
											Location Information
										</h4>
										<div className="space-y-3">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<p className="text-sm font-medium text-muted-foreground">District</p>
													<p className="text-foreground font-medium">{selectedApp.district}</p>
												</div>
												<div>
													<p className="text-sm font-medium text-muted-foreground">Block</p>
													<p className="text-foreground font-medium">{selectedApp.block}</p>
												</div>
											</div>
											<div>
												<p className="text-sm font-medium text-muted-foreground">Address</p>
												<p className="text-foreground font-medium">{selectedApp.address}</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					<SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex sm:justify-end gap-3 z-10">
						<Button variant="outline" onClick={() => setShowModal(false)}>
							Close
						</Button>
						<Button
							variant="destructive"
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
						>
							{deleting && (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							)}
							Delete Application
						</Button>
						<Button
							className="bg-red-600 hover:bg-red-700"
							onClick={() => {
								updateStatus(
									selectedApp.id,
									selectedApp.status,
									statusNotes
								);
								setShowModal(false);
							}}
							disabled={updating}
						>
							{updating && (
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							)}
							Save Changes
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			{/* Enhanced PDF Viewer Modal */}
			<AnimatePresence>
				{showPDFModal && selectedPDF && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4"
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="bg-background rounded-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden mx-2 border"
						>
							{/* PDF Header */}
							<div className="bg-muted/30 px-4 sm:px-6 py-4 border-b shrink-0">
								<div className="flex justify-between items-center">
									<h3 className="text-lg font-semibold text-foreground flex items-center">
										<FileText className="w-5 h-5 mr-2 text-green-600" />
										Resume Viewer
									</h3>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setShowPDFModal(false)}
										className="text-muted-foreground hover:text-foreground hover:bg-muted"
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
									</Button>
								</div>
							</div>

							{/* PDF Viewer */}
							<div className="flex-1 bg-muted/50">
								<iframe
									src={`${selectedPDF}#toolbar=1&navpanes=0`}
									className="w-full h-full border-none"
									title="Resume PDF"
								/>
							</div>

							{/* Footer */}
							<div className="bg-background px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center shrink-0">
								<p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
									Use the toolbar above to navigate and zoom
								</p>
								<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
									<Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
										<a href={selectedPDF} download="resume.pdf">
											<Download size={14} className="mr-2 sm:w-4 sm:h-4" />
											Download
										</a>
									</Button>
									<Button asChild className="bg-green-600 hover:bg-green-700 text-white">
										<a href={selectedPDF} target="_blank" rel="noopener noreferrer">
											<ExternalLink size={14} className="mr-2 sm:w-4 sm:h-4" />
											Open in New Tab
										</a>
									</Button>
									<Button
										variant="outline"
										onClick={() => setShowPDFModal(false)}
									>
										Close
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
