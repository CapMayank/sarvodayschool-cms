/** @format */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Loader2,
	Calendar,
	CheckCircle,
	XCircle,
	Trash2,
	AlertTriangle,
	Database,
	Users,
	FileSpreadsheet,
	Edit3,
} from "lucide-react";

interface Publication {
	id: number;
	academicYear: string;
	publishDate: string;
	isPublished: boolean;
}

export default function PublicationControl() {
	const [publications, setPublications] = useState<Publication[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [selectedYearForDeletion, setSelectedYearForDeletion] = useState("");
	const [confirmationText, setConfirmationText] = useState("");
	const [editingPublication, setEditingPublication] =
		useState<Publication | null>(null);
	const [formData, setFormData] = useState({
		academicYear: "2024-25",
		publishDate: "",
		isPublished: false,
	});
	const [editFormData, setEditFormData] = useState({
		academicYear: "",
		publishDate: "",
		isPublished: false,
	});

	const loadPublications = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/result/publication");
			const data = await response.json();
			setPublications(data.publications || []);
		} catch (error) {
			console.error("Error loading publications:", error);
			toast.error("Failed to load publication settings");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPublications();
	}, []);

	const handleSave = async () => {
		if (!formData.academicYear || !formData.publishDate) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			setSaving(true);
			const response = await fetch("/api/result/publication", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to save publication settings");

			toast.success("Publication settings saved successfully");
			setFormData({
				academicYear: "2024-25",
				publishDate: "",
				isPublished: false,
			});
			await loadPublications();
		} catch (error) {
			console.error("Error saving publication settings:", error);
			toast.error("Failed to save publication settings");
		} finally {
			setSaving(false);
		}
	};

	const handleTogglePublish = async (
		academicYear: string,
		currentStatus: boolean
	) => {
		try {
			const response = await fetch("/api/result/publication", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					academicYear,
					isPublished: !currentStatus,
				}),
			});

			if (!response.ok) throw new Error("Failed to update publication status");

			toast.success(
				`Results ${!currentStatus ? "published" : "unpublished"} successfully`
			);
			await loadPublications();
		} catch (error) {
			console.error("Error updating publication status:", error);
			toast.error("Failed to update publication status");
		}
	};

	const handleDeleteOlderData = async () => {
		if (confirmationText !== selectedYearForDeletion) {
			toast.error("Please type the academic year exactly to confirm");
			return;
		}

		try {
			setDeleting(true);
			const response = await fetch("/api/result/publication/delete", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					academicYear: selectedYearForDeletion,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to delete data");
			}

			const result = await response.json();
			toast.success(
				`Successfully deleted ${result.studentsDeleted} students and ${result.resultsDeleted} results for ${selectedYearForDeletion}`
			);

			setShowDeleteDialog(false);
			setConfirmationText("");
			setSelectedYearForDeletion("");
			await loadPublications();
		} catch (error) {
			console.error("Error deleting older data:", error);
			toast.error("Failed to delete data: " + (error as Error).message);
		} finally {
			setDeleting(false);
		}
	};

	const openDeleteDialog = (academicYear: string) => {
		setSelectedYearForDeletion(academicYear);
		setConfirmationText("");
		setShowDeleteDialog(true);
	};

	const openEditDialog = (publication: Publication) => {
		setEditingPublication(publication);
		// Convert ISO string to datetime-local format
		const publishDate = new Date(publication.publishDate);
		const formattedDate = publishDate.toISOString().slice(0, 16);

		setEditFormData({
			academicYear: publication.academicYear,
			publishDate: formattedDate,
			isPublished: publication.isPublished,
		});
		setShowEditDialog(true);
	};

	const handleEditSave = async () => {
		if (!editFormData.academicYear || !editFormData.publishDate) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			setSaving(true);
			const response = await fetch("/api/result/publication", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editFormData),
			});

			if (!response.ok)
				throw new Error("Failed to update publication settings");

			toast.success("Publication settings updated successfully");
			setShowEditDialog(false);
			setEditingPublication(null);
			await loadPublications();
		} catch (error) {
			console.error("Error updating publication settings:", error);
			toast.error("Failed to update publication settings");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Add New Publication */}
			<div className="border rounded-lg p-4 bg-gray-50 space-y-4">
				<h3 className="font-semibold text-lg flex items-center gap-2">
					<Calendar className="h-5 w-5" />
					Configure Result Publication
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label>Academic Year</Label>
						<Input
							value={formData.academicYear}
							onChange={(e) =>
								setFormData({ ...formData, academicYear: e.target.value })
							}
							placeholder="2024-25"
						/>
					</div>
					<div>
						<Label>Publish Date & Time</Label>
						<Input
							type="datetime-local"
							value={formData.publishDate}
							onChange={(e) =>
								setFormData({ ...formData, publishDate: e.target.value })
							}
						/>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="isPublished"
						checked={formData.isPublished}
						onChange={(e) =>
							setFormData({ ...formData, isPublished: e.target.checked })
						}
						className="h-4 w-4"
					/>
					<Label htmlFor="isPublished" className="cursor-pointer">
						Publish immediately (override date/time)
					</Label>
				</div>
				<Button onClick={handleSave} disabled={saving}>
					{saving ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Saving...
						</>
					) : (
						"Save Publication Settings"
					)}
				</Button>
			</div>

			{/* Existing Publications */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Configured Publications</h3>
				{publications.length === 0 ? (
					<div className="text-center py-12 text-gray-500">
						<Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
						<p>No publication settings found. Add one to get started.</p>
					</div>
				) : (
					<div className="space-y-3">
						{publications.map((pub) => (
							<div key={pub.id} className="border rounded-lg p-4">
								<div className="flex items-center justify-between mb-3">
									<div className="space-y-1">
										<div className="flex items-center gap-3">
											<h4 className="font-semibold text-lg">
												{pub.academicYear}
											</h4>
											{pub.isPublished ? (
												<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
													<CheckCircle className="h-3 w-3" />
													Published
												</span>
											) : (
												<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
													<XCircle className="h-3 w-3" />
													Not Published
												</span>
											)}
										</div>
										<p className="text-sm text-gray-600">
											Publish Date: {new Date(pub.publishDate).toLocaleString()}
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => openEditDialog(pub)}
											className="flex items-center gap-1"
										>
											<Edit3 className="h-4 w-4" />
											Edit
										</Button>
										<Button
											variant={pub.isPublished ? "outline" : "default"}
											onClick={() =>
												handleTogglePublish(pub.academicYear, pub.isPublished)
											}
										>
											{pub.isPublished ? "Unpublish" : "Publish Now"}
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => openDeleteDialog(pub.academicYear)}
											className="flex items-center gap-1"
										>
											<Trash2 className="h-4 w-4" />
											Delete All Data
										</Button>
									</div>
								</div>

								{/* Warning notice for data deletion */}
								<div className="bg-red-50 border border-red-200 rounded p-3">
									<div className="flex items-start gap-2">
										<AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
										<div className="text-xs text-red-700">
											<p className="font-medium mb-1">
												⚠️ Danger Zone: Complete Data Removal
											</p>
											<p>
												Clicking &quot;Delete All Data&quot; will permanently
												remove ALL students, marks, and results for academic
												year {pub.academicYear}. This action cannot be undone.
											</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Confirmation Dialog for Data Deletion */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<AlertTriangle className="h-5 w-5" />
							Confirm Complete Data Deletion
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<Database className="h-6 w-6 text-red-600 shrink-0 mt-1" />
								<div className="space-y-2">
									<h4 className="font-semibold text-red-900">
										This will permanently delete:
									</h4>
									<ul className="text-sm text-red-800 space-y-1">
										<li className="flex items-center gap-2">
											<Users className="h-4 w-4" />
											All students for {selectedYearForDeletion}
										</li>
										<li className="flex items-center gap-2">
											<FileSpreadsheet className="h-4 w-4" />
											All marks and results for {selectedYearForDeletion}
										</li>
										<li className="flex items-center gap-2">
											<Database className="h-4 w-4" />
											All related database records
										</li>
									</ul>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-gray-900">
								Type the academic year &quot;{selectedYearForDeletion}&quot; to
								confirm:
							</Label>
							<Input
								value={confirmationText}
								onChange={(e) => setConfirmationText(e.target.value)}
								placeholder={selectedYearForDeletion}
								className="border-red-300 focus:ring-red-500 focus:border-red-500"
							/>
						</div>

						<div className="bg-yellow-50 border border-yellow-200 rounded p-3">
							<p className="text-xs text-yellow-800">
								<strong>⚠️ Warning:</strong> This action is irreversible. Make
								sure you have a backup before proceeding.
							</p>
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
							disabled={deleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteOlderData}
							disabled={
								deleting || confirmationText !== selectedYearForDeletion
							}
							className="flex items-center gap-2"
						>
							{deleting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="h-4 w-4" />
									Delete All Data
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Publication Dialog */}
			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Edit3 className="h-5 w-5" />
							Edit Publication Settings
							{editingPublication && (
								<span className="text-sm text-gray-500 font-normal">
									- {editingPublication.academicYear}
								</span>
							)}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label>Academic Year</Label>
							<Input
								value={editFormData.academicYear}
								onChange={(e) =>
									setEditFormData({
										...editFormData,
										academicYear: e.target.value,
									})
								}
								placeholder="2024-25"
							/>
						</div>

						<div>
							<Label>Publish Date & Time</Label>
							<Input
								type="datetime-local"
								value={editFormData.publishDate}
								onChange={(e) =>
									setEditFormData({
										...editFormData,
										publishDate: e.target.value,
									})
								}
							/>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="editIsPublished"
								checked={editFormData.isPublished}
								onChange={(e) =>
									setEditFormData({
										...editFormData,
										isPublished: e.target.checked,
									})
								}
								className="h-4 w-4"
							/>
							<Label htmlFor="editIsPublished" className="cursor-pointer">
								Publish immediately (override date/time)
							</Label>
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => setShowEditDialog(false)}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button onClick={handleEditSave} disabled={saving}>
							{saving ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								"Update Publication"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
