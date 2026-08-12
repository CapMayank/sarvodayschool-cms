/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
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
import { Loader2, Search } from "lucide-react";

export default function AdmissionsTab() {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [forms, setForms] = useState<any[]>([]);
                                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
				return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent";
			case "Reviewed":
				return "bg-purple-100 text-purple-800 hover:bg-purple-100 border-transparent";
			case "Contacted":
				return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-transparent";
			case "Admitted":
				return "bg-green-100 text-green-800 hover:bg-green-100 border-transparent";
			case "Rejected":
				return "bg-red-100 text-red-800 hover:bg-red-100 border-transparent";
			default:
				return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-transparent";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">Admission Management</CardTitle>
						<CardDescription>
							Review and manage student applications
						</CardDescription>
					</div>
					<div className="text-center sm:text-right">
						<div className="text-2xl font-bold text-blue-600">
							{forms.length}
						</div>
						<div className="text-xs text-muted-foreground">
							Total Applications
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Filter Pills */}
					<div className="flex flex-wrap gap-2">
						{["All", "New", "Reviewed", "Contacted", "Admitted", "Rejected"].map(
							(status) => (
								<Button
									key={status}
									variant={filterStatus === status ? "default" : "outline"}
									onClick={() => setFilterStatus(status)}
									className="text-xs sm:text-sm"
								>
									{status}
									<span className="ml-2 opacity-70">
										({statusCounts[status as keyof typeof statusCounts]})
									</span>
								</Button>
							)
						)}
					</div>
				</CardContent>
			</Card>

			{/* Table */}
			<Card>
				<CardContent className="p-0">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
							<span className="ml-3 text-muted-foreground">
								Loading applications...
							</span>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-muted/50">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
											Student Details
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
											Contact
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
											Location
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
								<tbody className="bg-background divide-y divide-gray-200">
									{filteredForms.map((form) => (
										<tr
											key={form.id}
											className="hover:bg-muted/50 transition-colors"
										>
											<td className="px-6 py-4">
												<div className="flex items-start space-x-3">
													<div className="flex-shrink-0">
														<div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
															<span className="font-semibold text-sm">
																{form.studentName.charAt(0).toUpperCase()}
															</span>
														</div>
													</div>
													<div>
														<div className="font-semibold text-foreground">
															{form.studentName}
														</div>
														<div className="text-sm text-muted-foreground">
															Class {form.class} • {form.gender}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm">
													<div className="font-medium text-foreground">
														{form.mobileNumber}
													</div>
													{form.alternateMobile && (
														<div className="text-muted-foreground">
															{form.alternateMobile}
														</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm">
													<div className="font-medium text-foreground">
														{form.district}
													</div>
													<div className="text-muted-foreground">{form.block}</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<Badge variant="outline" className={getStatusColor(form.status)}>
													{form.status}
												</Badge>
											</td>
											<td className="px-6 py-4 text-sm text-foreground">
												{new Date(form.createdAt).toLocaleDateString("en-IN", {
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
														onClick={() => viewDetails(form)}
													>
														View Details
													</Button>
													<Button
														variant="outline"
														size="sm"
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
														onClick={() => {
															if (
																confirm(
																	"Are you sure you want to delete this application?"
																)
															) {
																handleDelete(form.id);
															}
														}}
													>
														Delete
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					{filteredForms.length === 0 && !loading && (
						<div className="text-center py-16 px-4">
							<div className="mx-auto h-16 w-16 text-muted-foreground mb-4 flex items-center justify-center">
								<Search className="h-10 w-10 opacity-50" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No applications found
							</h3>
							<p className="text-muted-foreground">
								{filterStatus === "All"
									? "Applications will appear here when students submit their forms."
									: `No applications with status "${filterStatus}" found.`}
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sheet Modal */}
			<Sheet open={showModal} onOpenChange={(open) => {
				if (!open) setShowModal(false);
			}}>
				<SheetContent className="w-full sm:max-w-2xl overflow-y-auto" side="right">
					<SheetHeader className="mb-6">
						<SheetTitle className="text-2xl flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
								<span className="font-bold">
									{selectedForm?.studentName?.charAt(0).toUpperCase()}
								</span>
							</div>
							<div>
								<div>{selectedForm?.studentName}</div>
								<div className="text-sm text-muted-foreground font-normal">
									Application Details
								</div>
							</div>
						</SheetTitle>
						<SheetDescription></SheetDescription>
					</SheetHeader>

					{selectedForm && (
						<div className="space-y-6 pb-20">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Status Management */}
								<div className="bg-muted/50 rounded-lg p-4 border md:col-span-2">
									<h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
										Status Management
									</h4>
									<div className="grid sm:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-foreground mb-2">
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
												className="w-full p-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
											>
												<option value="New">New</option>
												<option value="Reviewed">Reviewed</option>
												<option value="Contacted">Contacted</option>
												<option value="Admitted">Admitted</option>
												<option value="Rejected">Rejected</option>
											</select>
											<div className="mt-3">
												<Badge className={getStatusColor(selectedForm.status)}>
													{selectedForm.status}
												</Badge>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-foreground mb-2">
												Admin Notes
											</label>
											<Textarea
												value={statusNotes}
												onChange={(e) => setStatusNotes(e.target.value)}
												className="resize-none h-24"
												placeholder="Add notes about this application..."
											/>
										</div>
									</div>
								</div>

								{/* Student Information */}
								<div className="bg-background border rounded-lg p-4">
									<h4 className="font-semibold text-foreground mb-4">
										Student Information
									</h4>
									<div className="space-y-4">
										<div>
											<p className="text-sm font-medium text-muted-foreground">Gender</p>
											<p className="text-foreground">{selectedForm.gender}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
											<p className="text-foreground">
												{new Date(selectedForm.dateOfBirth).toLocaleDateString("en-IN")}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Class</p>
											<p className="text-foreground">{selectedForm.class}</p>
										</div>
									</div>
								</div>

								{/* Parent Information */}
								<div className="bg-background border rounded-lg p-4">
									<h4 className="font-semibold text-foreground mb-4">
										Parent Information
									</h4>
									<div className="space-y-4">
										<div>
											<p className="text-sm font-medium text-muted-foreground">Father's Name</p>
											<p className="text-foreground">{selectedForm.fatherName}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Mother's Name</p>
											<p className="text-foreground">{selectedForm.motherName}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
											<p className="text-foreground">{selectedForm.mobileNumber}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Alternate Mobile</p>
											<p className="text-foreground">{selectedForm.alternateMobile || "—"}</p>
										</div>
									</div>
								</div>

								{/* Location */}
								<div className="bg-background border rounded-lg p-4 md:col-span-2">
									<h4 className="font-semibold text-foreground mb-4">
										Location Details
									</h4>
									<div className="grid sm:grid-cols-2 gap-4">
										<div>
											<p className="text-sm font-medium text-muted-foreground">District</p>
											<p className="text-foreground">{selectedForm.district}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">Block</p>
											<p className="text-foreground">{selectedForm.block}</p>
										</div>
										<div className="sm:col-span-2">
											<p className="text-sm font-medium text-muted-foreground">Address</p>
											<p className="text-foreground">{selectedForm.address}</p>
										</div>
									</div>
								</div>

								{/* Previous School */}
								<div className="bg-background border rounded-lg p-4 md:col-span-2">
									<h4 className="font-semibold text-foreground mb-4">
										Previous School
									</h4>
									<p className="text-foreground">{selectedForm.previousSchool || "Not specified"}</p>
								</div>
							</div>
						</div>
					)}

					<SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex sm:justify-end gap-3">
						<Button variant="outline" onClick={() => setShowModal(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
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
						>
							{deleting && (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							)}
							Delete Application
						</Button>
						<Button
							className="bg-blue-600 hover:bg-blue-700"
							onClick={() => {
								updateStatus(
									selectedForm.id,
									selectedForm.status,
									statusNotes
								);
								setShowModal(false);
							}}
							disabled={updating}
						>
							{updating && (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							)}
							Save Changes
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
