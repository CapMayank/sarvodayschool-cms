/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { deleteCloudinaryImage } from "@/lib/cloudinary-helper";
import DeferredImageUpload from "@/components/DeferredImageUpload";
import ReorderableList from "@/components/ReorderableList";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	Loader2,
	Edit,
	Trash2,
	Building2,
	GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { X } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

interface Highlight {
	title: string;
	value: string;
}

interface FacilityFeature {
	title: string;
	value: string;
}

interface MediaItem {
	type: "image" | "youtube";
	src: string;
	caption: string;
}

interface Facility {
	id: number;
	slug: string;
	title: string;
	description: string;
	imageUrl: string;
	highlights: Highlight[];
	facilityFeatures: FacilityFeature[];
	mediaGallery: MediaItem[];
	order: number;
	isActive: boolean;
}

export default function FacilitiesTab() {
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<number | null>(null);
	const [isReordering, setIsReordering] = useState(false);
	const [formData, setFormData] = useState({
		slug: "",
		title: "",
		description: "",
		imageUrl: "",
		highlights: [] as Highlight[],
		facilityFeatures: [] as FacilityFeature[],
		mediaGallery: [] as MediaItem[],
		isActive: true,
		order: 0,
	});

	// Deferred image uploads
	const [mainImageFile, setMainImageFile] = useState<File | null>(null);
	const [mediaImageFiles, setMediaImageFiles] = useState<Map<number, File>>(
		new Map()
	);

	useEffect(() => {
		loadFacilities();
	}, []);

	const loadFacilities = async () => {
		try {
			setLoading(true);
			const data = await apiClient.getFacilities();
			setFacilities(data);
		} catch (error) {
			console.error("Error loading facilities:", error);
			toast.error("Failed to load facilities");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			slug: "",
			title: "",
			description: "",
			imageUrl: "",
			highlights: [],
			facilityFeatures: [],
			mediaGallery: [],
			isActive: true,
			order: 0,
		});
		setMainImageFile(null);
		setMediaImageFiles(new Map());
		setEditingId(null);
	};

	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	};

	// Helper function to upload a single image
	const uploadImageToCloudinary = async (file: File): Promise<string> => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("folder", "sarvodaya/facilities");

		const response = await fetch("/api/cloudinary/upload", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to upload image");
		}

		const data = await response.json();
		return data.url;
	};

	const handleSubmit = async () => {
		if (!formData.title || !formData.description) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!mainImageFile && !formData.imageUrl) {
			toast.error("Please upload a main image");
			return;
		}

		let newlyUploadedImages: string[] = [];
		try {
			setSubmitting(true);
			let mainImageUrl = formData.imageUrl;
			const updatedMediaGallery = [...formData.mediaGallery];

			// Upload main image if there's a new file
			if (mainImageFile) {
				toast.loading("Uploading main image...");
				mainImageUrl = await uploadImageToCloudinary(mainImageFile);
				newlyUploadedImages.push(mainImageUrl);
				toast.dismiss();
			}

			// Upload media gallery images if there are new files
			if (mediaImageFiles.size > 0) {
				toast.loading("Uploading gallery images...");
				for (const [index, file] of mediaImageFiles.entries()) {
					const url = await uploadImageToCloudinary(file);
					updatedMediaGallery[index].src = url;
					newlyUploadedImages.push(url);
				}
				toast.dismiss();
			}

			const slug = formData.slug || generateSlug(formData.title);
			const dataToSend = {
				...formData,
				slug,
				imageUrl: mainImageUrl,
				mediaGallery: updatedMediaGallery,
			};

			if (editingId) {
				await apiClient.updateFacility(editingId, dataToSend);
				toast.success("Facility updated successfully");
			} else {
				await apiClient.createFacility(dataToSend);
				toast.success("Facility created successfully");
			}

			setShowModal(false);
			resetForm();
			await loadFacilities();
		} catch (error) {
			console.error("Error saving facility:", error);
			if (newlyUploadedImages.length > 0) {
				for (const url of newlyUploadedImages) {
					const publicIdMatch = url.match(/\/v\d+\/(.+?)\.[a-zA-Z0-9]+$/);
					if (publicIdMatch) {
						const publicId = publicIdMatch[1];
						fetch("/api/cloudinary/delete", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ publicId }),
						}).catch(console.error);
					}
				}
			}
			toast.error("Failed to save facility");
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (facility: Facility) => {
		setFormData({
			slug: facility.slug,
			title: facility.title,
			description: facility.description,
			imageUrl: facility.imageUrl,
			highlights: facility.highlights || [],
			facilityFeatures: facility.facilityFeatures || [],
			mediaGallery: facility.mediaGallery || [],
			isActive: facility.isActive,
			order: facility.order,
		});
		setEditingId(facility.id);
		setShowModal(true);
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this facility?")) return;

		const facility = facilities.find((f) => f.id === id);

		try {
			setDeleting(id);
			await apiClient.deleteFacility(id);

			if (facility?.imageUrl) {
				await deleteCloudinaryImage(facility.imageUrl);
			}

			toast.success("Facility deleted successfully");
			await loadFacilities();
		} catch (error) {
			console.error("Error deleting facility:", error);
			toast.error("Failed to delete facility");
		} finally {
			setDeleting(null);
		}
	};

	const handleReorder = async (reorderedItems: Facility[]) => {
		setIsReordering(true);
		try {
			for (const item of reorderedItems) {
				await apiClient.updateFacility(item.id, {
					slug: item.slug,
					title: item.title,
					description: item.description,
					imageUrl: item.imageUrl,
					isActive: item.isActive,
					order: item.order,
				});
			}
			setFacilities(reorderedItems);
			toast.success("Order updated successfully");
		} catch (error) {
			console.error("Error reordering:", error);
			toast.error("Failed to update order");
			await loadFacilities();
		} finally {
			setIsReordering(false);
		}
	};

	const addHighlight = () => {
		setFormData({
			...formData,
			highlights: [...formData.highlights, { title: "", value: "" }],
		});
	};

	const updateHighlight = (
		index: number,
		field: keyof Highlight,
		value: string
	) => {
		const newHighlights = [...formData.highlights];
		newHighlights[index][field] = value;
		setFormData({ ...formData, highlights: newHighlights });
	};

	const removeHighlight = (index: number) => {
		setFormData({
			...formData,
			highlights: formData.highlights.filter((_, i) => i !== index),
		});
	};

	const addFacilityFeature = () => {
		setFormData({
			...formData,
			facilityFeatures: [
				...formData.facilityFeatures,
				{ title: "", value: "" },
			],
		});
	};

	const updateFacilityFeature = (
		index: number,
		field: keyof FacilityFeature,
		value: string
	) => {
		const newFeatures = [...formData.facilityFeatures];
		newFeatures[index][field] = value;
		setFormData({ ...formData, facilityFeatures: newFeatures });
	};

	const removeFacilityFeature = (index: number) => {
		setFormData({
			...formData,
			facilityFeatures: formData.facilityFeatures.filter((_, i) => i !== index),
		});
	};

	const addMediaItem = () => {
		setFormData({
			...formData,
			mediaGallery: [
				...formData.mediaGallery,
				{ type: "image", src: "", caption: "" },
			],
		});
	};

	const updateMediaItem = (
		index: number,
		field: keyof MediaItem,
		value: string
	) => {
		const newMedia = [...formData.mediaGallery];
		newMedia[index] = { ...newMedia[index], [field]: value };
		setFormData({ ...formData, mediaGallery: newMedia });
	};

	const removeMediaItem = (index: number) => {
		setFormData({
			...formData,
			mediaGallery: formData.mediaGallery.filter((_, i) => i !== index),
		});
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">Facilities Management</CardTitle>
						<CardDescription>
							Manage school facilities displayed on your website
						</CardDescription>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-right hidden sm:block">
							<div className="text-2xl font-bold text-blue-600">
								{facilities.length}
							</div>
							<div className="text-xs text-muted-foreground">
								Total Facilities
							</div>
						</div>
						<Button
							className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
							onClick={() => {
								resetForm();
								setShowModal(true);
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							Add Facility
						</Button>
					</div>
				</CardHeader>
			</Card>

			{/* Content */}
			<Card>
				<CardContent className="p-0">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
							<span className="ml-3 text-muted-foreground">
								Loading facilities...
							</span>
						</div>
					) : facilities.length === 0 ? (
						<div className="text-center py-16 px-4">
							<div className="mx-auto h-16 w-16 text-muted-foreground mb-4">
								<Building2 size={48} className="w-full h-full" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No facilities yet
							</h3>
							<p className="text-muted-foreground">
								Click "Add Facility" to create your first facility.
							</p>
						</div>
					) : (
						<div className="p-6">
							{facilities.length > 0 && (
								<div className="mb-6 p-4 bg-muted/50 rounded-lg border">
									<div className="flex items-center gap-2">
										<GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
										<p className="text-sm text-muted-foreground">
											<strong>Tip:</strong> Drag items using the grip handle or{" "}
											<span className="sm:hidden">
												long-press and drag on mobile
											</span>
											<span className="hidden sm:inline">
												drag to reorder them
											</span>
											. Changes are saved automatically.
										</p>
									</div>
								</div>
							)}

							<ReorderableList items={facilities} onReorder={handleReorder}>
								{(item, index) => (
									<div className="flex flex-col sm:flex-row items-center gap-4 w-full">
											{/* Image */}
											<div className="relative shrink-0 w-full sm:w-auto">
												<Image
													src={item.imageUrl}
													alt={item.title}
													width={128}
													height={80}
													className="h-20 w-full sm:w-32 object-cover rounded-lg border"
												/>
												{!item.isActive && (
													<div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
														<span className="text-white text-xs font-medium">
															Inactive
														</span>
													</div>
												)}
											</div>

											{/* Content */}
											<div className="flex-grow min-w-0 text-center sm:text-left">
												<h3 className="font-semibold text-lg">
													{item.title}
												</h3>
												<p className="text-muted-foreground text-sm mt-1 line-clamp-2">
													{item.description}
												</p>
												<div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
													<Badge
														variant={item.isActive ? "default" : "secondary"}
														className={
															item.isActive
																? "bg-green-600 hover:bg-green-600"
																: ""
														}
													>
														{item.isActive ? "Active" : "Inactive"}
													</Badge>
													<Badge variant="outline" className="text-blue-600 border-blue-200">
														Position #{index + 1}
													</Badge>
												</div>
											</div>

											{/* Actions */}
											<div className="flex gap-2 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
												<Button
													variant="outline"
													size="sm"
													className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
													onClick={() => handleEdit(item)}
													disabled={isReordering}
												>
													<Edit className="w-4 h-4 sm:mr-2" />
													<span className="hidden sm:inline">Edit</span>
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
													onClick={() => handleDelete(item.id)}
													disabled={deleting === item.id || isReordering}
												>
													{deleting === item.id ? (
														<Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
													) : (
														<Trash2 className="w-4 h-4 sm:mr-2" />
													)}
													<span className="hidden sm:inline">Delete</span>
												</Button>
											</div>
										</div>
								)}
							</ReorderableList>
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
						<SheetTitle className="text-2xl">
							{editingId ? "Edit Facility" : "Create New Facility"}
						</SheetTitle>
						<SheetDescription>
							Add school facilities to display on your website
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-6 pb-20">
						<div>
							<Label className="mb-2 block">
								Facility Name <span className="text-red-500">*</span>
							</Label>
							<Input
								placeholder="e.g., Science Laboratory"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
							/>
						</div>
						<div>
							<Label className="mb-2 block">
								URL Slug (Optional)
							</Label>
							<Input
								placeholder="Auto-generated from title"
								value={formData.slug}
								onChange={(e) =>
									setFormData({ ...formData, slug: e.target.value })
								}
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Leave empty to auto-generate from title
							</p>
						</div>
						<div>
							<Label className="mb-2 block">
								Description <span className="text-red-500">*</span>
							</Label>
							<Textarea
								placeholder="Brief description of the facility"
								value={formData.description}
								onChange={(e) =>
									setFormData({
										...formData,
										description: e.target.value,
									})
								}
								rows={3}
								className="resize-none"
							/>
						</div>
						<div>
							<Label className="mb-2 block">
								Facility Image <span className="text-red-500">*</span>
							</Label>
							<DeferredImageUpload
								onImageSelect={(file) => setMainImageFile(file)}
								onImageRemove={() => {
									setMainImageFile(null);
									if (!editingId) {
										setFormData({ ...formData, imageUrl: "" });
									}
								}}
								previewUrl={formData.imageUrl}
								label="Upload Main Image"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Image uploads when you submit the form
							</p>
						</div>

						<div className="bg-muted/50 rounded-lg p-4 border">
							<label className="flex items-center gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={formData.isActive}
									onChange={(e) =>
										setFormData({
											...formData,
											isActive: e.target.checked,
										})
									}
									className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
								/>
								<div>
									<span className="text-sm font-medium">
										Active
									</span>
									<p className="text-xs text-muted-foreground mt-1">
										Only active facilities will be displayed on the
										website
									</p>
								</div>
							</label>
						</div>

						{/* Highlights Section */}
						<div className="space-y-4 border-t pt-4">
							<div className="flex justify-between items-center">
								<h4 className="font-semibold text-foreground">
									Highlights
								</h4>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={addHighlight}
									className="text-blue-600"
								>
									+ Add Highlight
								</Button>
							</div>

							{formData.highlights.map((highlight, index) => (
								<div
									key={index}
									className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg border"
								>
									<div className="flex-1 space-y-2">
										<Input
											placeholder="Title (e.g., Capacity)"
											value={highlight.title}
											onChange={(e) =>
												updateHighlight(index, "title", e.target.value)
											}
										/>
										<Input
											placeholder="Value (e.g., 1000+ People)"
											value={highlight.value}
											onChange={(e) =>
												updateHighlight(index, "value", e.target.value)
											}
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => removeHighlight(index)}
										className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>

						{/* Facility Features Section */}
						<div className="space-y-4 border-t pt-4">
							<div className="flex justify-between items-center">
								<h4 className="font-semibold text-foreground">
									Facility Features
								</h4>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={addFacilityFeature}
									className="text-blue-600"
								>
									+ Add Feature
								</Button>
							</div>

							{formData.facilityFeatures.map((feature, index) => (
								<div
									key={index}
									className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg border"
								>
									<div className="flex-1 space-y-2">
										<Input
											placeholder="Title (e.g., Safety Measures)"
											value={feature.title}
											onChange={(e) =>
												updateFacilityFeature(
													index,
													"title",
													e.target.value
												)
											}
										/>
										<Input
											placeholder="Value (e.g., CCTV, Fire safety)"
											value={feature.value}
											onChange={(e) =>
												updateFacilityFeature(
													index,
													"value",
													e.target.value
												)
											}
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => removeFacilityFeature(index)}
										className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>

						{/* Media Gallery Section */}
						<div className="space-y-4 border-t pt-4">
							<div className="flex justify-between items-center">
								<h4 className="font-semibold text-foreground">
									Media Gallery
								</h4>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={addMediaItem}
									className="text-blue-600"
								>
									+ Add Media
								</Button>
							</div>

							{formData.mediaGallery.map((media, index) => (
								<div
									key={index}
									className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg border"
								>
									<div className="flex-1 space-y-2">
										<select
											value={media.type}
											onChange={(e) =>
												updateMediaItem(
													index,
													"type",
													e.target.value as "image" | "youtube"
												)
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										>
											<option value="image">Image</option>
											<option value="youtube">YouTube</option>
										</select>

										{media.type === "image" ? (
											<DeferredImageUpload
												onImageSelect={(file) => {
													const newFiles = new Map(mediaImageFiles);
													newFiles.set(index, file);
													setMediaImageFiles(newFiles);
												}}
												onImageRemove={() => {
													const newFiles = new Map(mediaImageFiles);
													newFiles.delete(index);
													setMediaImageFiles(newFiles);
													updateMediaItem(index, "src", "");
												}}
												previewUrl={media.src}
												label="Upload Gallery Image"
											/>
										) : (
											<Input
												placeholder="YouTube Video ID (e.g., n6U7VgrejiY)"
												value={media.src}
												onChange={(e) =>
													updateMediaItem(index, "src", e.target.value)
												}
											/>
										)}

										<Input
											placeholder="Caption"
											value={media.caption}
											onChange={(e) =>
												updateMediaItem(index, "caption", e.target.value)
											}
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => removeMediaItem(index)}
										className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					</div>

					<SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex sm:justify-end gap-3">
						<Button variant="outline" onClick={() => setShowModal(false)}>
							Cancel
						</Button>
						<Button
							className="bg-blue-600 hover:bg-blue-700"
							onClick={handleSubmit}
							disabled={
								submitting ||
								!formData.title ||
								(!formData.imageUrl && !mainImageFile) ||
								!formData.description
							}
						>
							{submitting && (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							)}
							{editingId ? "Update Facility" : "Create Facility"}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
