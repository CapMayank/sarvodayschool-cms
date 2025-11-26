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

		try {
			setSubmitting(true);
			let mainImageUrl = formData.imageUrl;
			const updatedMediaGallery = [...formData.mediaGallery];

			// Upload main image if there's a new file
			if (mainImageFile) {
				toast.loading("Uploading main image...");
				mainImageUrl = await uploadImageToCloudinary(mainImageFile);
				toast.dismiss();
			}

			// Upload media gallery images if there are new files
			if (mediaImageFiles.size > 0) {
				toast.loading("Uploading gallery images...");
				for (const [index, file] of mediaImageFiles.entries()) {
					const url = await uploadImageToCloudinary(file);
					updatedMediaGallery[index].src = url;
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
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
							Facilities Management
						</h1>
						<p className="text-gray-600 mt-1 text-sm sm:text-base">
							Manage school facilities displayed on your website
						</p>
					</div>
					<div className="text-center sm:text-right">
						<div className="text-2xl sm:text-3xl font-bold text-blue-600">
							{facilities.length}
						</div>
						<div className="text-xs sm:text-sm text-gray-500">
							Total Facilities
						</div>
					</div>
				</div>

				<div className="mt-4 sm:mt-6">
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => {
							resetForm();
							setShowModal(true);
						}}
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm sm:text-base"
					>
						<Plus className="w-4 h-4" />
						Add Facility
					</motion.button>
				</div>
			</div>

			{/* Content */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-8 sm:py-12">
						<div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
						<span className="ml-3 text-gray-600 text-sm sm:text-base">
							Loading facilities...
						</span>
					</div>
				) : facilities.length === 0 ? (
					<div className="text-center py-12 sm:py-16 px-4">
						<div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4">
							<Building2 size={48} className="sm:w-16 sm:h-16" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
							No facilities yet
						</h3>
						<p className="text-gray-600 text-sm sm:text-base">
							Click "Add Facility" to create your first facility.
						</p>
					</div>
				) : (
					<div className="p-4 sm:p-6">
						{facilities.length > 0 && (
							<div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
								<div className="flex items-center gap-2">
									<GripVertical className="w-4 h-4 text-blue-600 shrink-0" />
									<p className="text-xs sm:text-sm text-blue-800">
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
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200"
								>
									<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
										{/* Image */}
										<div className="relative shrink-0 w-full sm:w-auto">
											<img
												src={item.imageUrl}
												alt={item.title}
												className="h-20 w-full sm:w-32 object-cover rounded-lg border border-gray-200"
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
											<h3 className="font-semibold text-gray-900 text-base sm:text-lg">
												{item.title}
											</h3>
											<p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
												{item.description}
											</p>
											<div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
												<span
													className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
														item.isActive
															? "bg-green-100 text-green-800"
															: "bg-gray-100 text-gray-800"
													}`}
												>
													{item.isActive ? "Active" : "Inactive"}
												</span>
												<span className="inline-flex px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
													Position #{index + 1}
												</span>
											</div>
										</div>

										{/* Actions */}
										<div className="flex gap-2 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												onClick={() => handleEdit(item)}
												disabled={isReordering}
												className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
											>
												<Edit className="w-4 h-4" />
												<span className="hidden sm:inline">Edit</span>
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												onClick={() => handleDelete(item.id)}
												disabled={deleting === item.id || isReordering}
												className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
											>
												{deleting === item.id ? (
													<Loader2 className="w-4 h-4 animate-spin" />
												) : (
													<Trash2 className="w-4 h-4" />
												)}
												<span className="hidden sm:inline">Delete</span>
											</motion.button>
										</div>
									</div>
								</motion.div>
							)}
						</ReorderableList>
					</div>
				)}
			</div>

			{/* Enhanced Modal */}
			<AnimatePresence>
				{showModal && (
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
							className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-2"
						>
							{/* Modal Header */}
							<div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 shrink-0">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg sm:text-xl font-semibold text-white">
											{editingId ? "Edit Facility" : "Create New Facility"}
										</h3>
										<p className="text-blue-100 text-xs sm:text-sm">
											Add school facilities to display on your website
										</p>
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
							<div className="flex-1 overflow-y-auto p-4 sm:p-6">
								<div className="space-y-4 sm:space-y-6">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Facility Name <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											placeholder="e.g., Science Laboratory"
											value={formData.title}
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											URL Slug (Optional)
										</label>
										<input
											type="text"
											placeholder="Auto-generated from title"
											value={formData.slug}
											onChange={(e) =>
												setFormData({ ...formData, slug: e.target.value })
											}
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
										/>
										<p className="text-xs text-gray-500 mt-1">
											Leave empty to auto-generate from title
										</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Description <span className="text-red-500">*</span>
										</label>
										<textarea
											placeholder="Brief description of the facility"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											rows={3}
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Facility Image <span className="text-red-500">*</span>
										</label>
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
										<p className="text-xs text-gray-500 mt-1">
											Image uploads when you submit the form
										</p>
									</div>{" "}
									<div className="bg-gray-50 rounded-lg p-4">
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
												<span className="text-sm font-medium text-gray-900">
													Active
												</span>
												<p className="text-xs text-gray-500">
													Only active facilities will be displayed on the
													website
												</p>
											</div>
										</label>
									</div>
									{/* Highlights Section */}
									<div className="space-y-4 border-t border-gray-200 pt-4">
										<div className="flex justify-between items-center">
											<h4 className="font-semibold text-gray-900">
												Highlights
											</h4>
											<button
												type="button"
												onClick={addHighlight}
												className="text-sm text-blue-600 hover:text-blue-700 font-medium"
											>
												+ Add Highlight
											</button>
										</div>

										{formData.highlights.map((highlight, index) => (
											<div
												key={index}
												className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
											>
												<div className="flex-1 space-y-2">
													<input
														type="text"
														placeholder="Title (e.g., Capacity)"
														value={highlight.title}
														onChange={(e) =>
															updateHighlight(index, "title", e.target.value)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													/>
													<input
														type="text"
														placeholder="Value (e.g., 1000+ People)"
														value={highlight.value}
														onChange={(e) =>
															updateHighlight(index, "value", e.target.value)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													/>
												</div>
												<button
													type="button"
													onClick={() => removeHighlight(index)}
													className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
												>
													<X className="h-4 w-4" />
												</button>
											</div>
										))}
									</div>
									{/* Facility Features Section */}
									<div className="space-y-4 border-t border-gray-200 pt-4">
										<div className="flex justify-between items-center">
											<h4 className="font-semibold text-gray-900">
												Facility Features
											</h4>
											<button
												type="button"
												onClick={addFacilityFeature}
												className="text-sm text-blue-600 hover:text-blue-700 font-medium"
											>
												+ Add Feature
											</button>
										</div>

										{formData.facilityFeatures.map((feature, index) => (
											<div
												key={index}
												className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
											>
												<div className="flex-1 space-y-2">
													<input
														type="text"
														placeholder="Title (e.g., Safety Measures)"
														value={feature.title}
														onChange={(e) =>
															updateFacilityFeature(
																index,
																"title",
																e.target.value
															)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													/>
													<input
														type="text"
														placeholder="Value (e.g., CCTV, Fire safety)"
														value={feature.value}
														onChange={(e) =>
															updateFacilityFeature(
																index,
																"value",
																e.target.value
															)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													/>
												</div>
												<button
													type="button"
													onClick={() => removeFacilityFeature(index)}
													className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
												>
													<X className="h-4 w-4" />
												</button>
											</div>
										))}
									</div>
									{/* Media Gallery Section */}
									<div className="space-y-4 border-t border-gray-200 pt-4">
										<div className="flex justify-between items-center">
											<h4 className="font-semibold text-gray-900">
												Media Gallery
											</h4>
											<button
												type="button"
												onClick={addMediaItem}
												className="text-sm text-blue-600 hover:text-blue-700 font-medium"
											>
												+ Add Media
											</button>
										</div>

										{formData.mediaGallery.map((media, index) => (
											<div
												key={index}
												className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
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
														<input
															type="text"
															placeholder="YouTube Video ID (e.g., n6U7VgrejiY)"
															value={media.src}
															onChange={(e) =>
																updateMediaItem(index, "src", e.target.value)
															}
															className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														/>
													)}

													<input
														type="text"
														placeholder="Caption"
														value={media.caption}
														onChange={(e) =>
															updateMediaItem(index, "caption", e.target.value)
														}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													/>
												</div>
												<button
													type="button"
													onClick={() => removeMediaItem(index)}
													className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
												>
													<X className="h-4 w-4" />
												</button>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200 shrink-0">
								<div className="flex flex-col sm:flex-row gap-3">
									<button
										onClick={() => setShowModal(false)}
										className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
									>
										Cancel
									</button>
									<button
										onClick={handleSubmit}
										disabled={
											submitting ||
											!formData.title ||
											!formData.imageUrl ||
											!formData.description
										}
										className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center text-sm sm:text-base"
									>
										{submitting && (
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										)}
										{editingId ? "Update Facility" : "Create Facility"}
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
