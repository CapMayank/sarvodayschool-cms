/** @format */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, CheckCircle, XCircle } from "lucide-react";

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
	const [formData, setFormData] = useState({
		academicYear: "2024-25",
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

	const handleTogglePublish = async (academicYear: string, currentStatus: boolean) => {
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
							<div
								key={pub.id}
								className="border rounded-lg p-4 flex items-center justify-between"
							>
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
										Publish Date:{" "}
										{new Date(pub.publishDate).toLocaleString()}
									</p>
								</div>
								<Button
									variant={pub.isPublished ? "outline" : "default"}
									onClick={() =>
										handleTogglePublish(pub.academicYear, pub.isPublished)
									}
								>
									{pub.isPublished ? "Unpublish" : "Publish Now"}
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
