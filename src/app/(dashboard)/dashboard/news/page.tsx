/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import DeferredImageUpload from "@/components/DeferredImageUpload";
import {
	deleteCloudinaryImage,
	uploadToCloudinary,
} from "@/lib/cloudinary-helper";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";
import {
	Plus,
	Loader2,
	Edit,
	Trash2,
	Calendar,
	Tag,
	Newspaper,
	Image as ImageIcon,
	X,
	Eye,
	EyeOff,
	Upload,
} from "lucide-react";

export default function NewsTab() {
	const [news, setNews] = useState<any[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<number | null>(null);

	// Separate state for pending file uploads
	const [pendingPrimaryImage, setPendingPrimaryImage] = useState<File | null>(
		null
	);
	const [pendingAdditionalImages, setPendingAdditionalImages] = useState<
		File[]
	>([]);

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		excerpt: "",
		detailedArticle: "",
		imageUrl: "",
		images: [] as string[],
		links: [] as Array<{ type: string; url: string; title: string }>,
		category: "General",
		publishDate: new Date().toISOString().split("T")[0],
		isPublished: true,
	});

	const loadNews = async () => {
		try {
			setLoading(true);
			const data = await apiClient.getNews(100);
			const sorted = data.sort(
				(a: any, b: any) =>
					new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
			);
			setNews(sorted);
		} catch (error) {
			console.error("Error loading news:", error);
			toast.error("Failed to load news");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadNews();
	}, []);

	const resetForm = () => {
		setFormData({
			title: "",
			slug: "",
			excerpt: "",
			detailedArticle: "",
			imageUrl: "",
			images: [],
			links: [],
			category: "General",
			publishDate: new Date().toISOString().split("T")[0],
			isPublished: true,
		});
		setPendingPrimaryImage(null);
		setPendingAdditionalImages([]);
		setEditingId(null);
	};

	// Auto-generate slug from title
	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
	};

	// Link management helpers
	const addLink = () => {
		setFormData({
			...formData,
			links: [...formData.links, { type: "custom", url: "", title: "" }],
		});
	};

	const updateLink = (
		index: number,
		field: "type" | "url" | "title",
		value: string
	) => {
		const newLinks = [...formData.links];
		newLinks[index][field] = value;
		setFormData({ ...formData, links: newLinks });
	};

	const removeLink = (index: number) => {
		setFormData({
			...formData,
			links: formData.links.filter((_, i) => i !== index),
		});
	};

	// Image management helpers
	const removeImage = (index: number) => {
		setFormData({
			...formData,
			images: formData.images.filter((_, i) => i !== index),
		});
	};

	const handleSubmit = async () => {
		if (!formData.title.trim()) {
			toast.error("Please enter a title");
			return;
		}

		if (!formData.excerpt.trim()) {
			toast.error("Please enter an excerpt");
			return;
		}

		try {
			setSubmitting(true);

			let uploadedPrimaryImageUrl = formData.imageUrl;
			let uploadedAdditionalImages = [...formData.images];

			// Upload primary image if a new file is selected
			if (pendingPrimaryImage) {
				toast.info("Uploading primary image...");
				try {
					uploadedPrimaryImageUrl = await uploadToCloudinary(
						pendingPrimaryImage,
						"sarvodaya/news"
					);
				} catch (error) {
					console.error("Error uploading primary image:", error);
					toast.error("Failed to upload primary image");
					setSubmitting(false);
					return;
				}
			}

			// Upload additional images if any
			if (pendingAdditionalImages.length > 0) {
				toast.info(
					`Uploading ${pendingAdditionalImages.length} additional image(s)...`
				);
				try {
					const uploadPromises = pendingAdditionalImages.map((file) =>
						uploadToCloudinary(file, "sarvodaya/news/gallery")
					);
					const newImageUrls = await Promise.all(uploadPromises);
					uploadedAdditionalImages = [
						...uploadedAdditionalImages,
						...newImageUrls,
					];
				} catch (error) {
					console.error("Error uploading additional images:", error);
					toast.error("Failed to upload some images");
					setSubmitting(false);
					return;
				}
			}

			// Auto-generate slug if not provided
			const slug = formData.slug || generateSlug(formData.title);

			const submitData = {
				title: formData.title,
				slug,
				excerpt: formData.excerpt,
				detailedArticle: formData.detailedArticle || formData.excerpt,
				imageUrl: uploadedPrimaryImageUrl,
				images: uploadedAdditionalImages,
				links: formData.links,
				category: formData.category,
				publishDate: formData.publishDate,
				isPublished: formData.isPublished,
			};

			if (editingId) {
				await apiClient.updateNews(editingId, submitData);
				toast.success("News updated successfully");
			} else {
				await apiClient.createNews(submitData);
				toast.success("News created successfully");
			}

			setShowModal(false);
			resetForm();
			await loadNews();
		} catch (err) {
			console.error("Error saving news:", err);
			toast.error("Failed to save news");
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (item: any) => {
		setFormData({
			title: item.title,
			slug: item.slug || "",
			excerpt: item.excerpt || "",
			detailedArticle: item.detailedArticle || item.excerpt || "",
			imageUrl: item.imageUrl || "",
			images: item.images || [],
			links: item.links || [],
			category: item.category,
			publishDate: new Date(item.publishDate).toISOString().split("T")[0],
			isPublished: item.isPublished !== undefined ? item.isPublished : true,
		});
		// Clear pending images when editing
		setPendingPrimaryImage(null);
		setPendingAdditionalImages([]);
		setEditingId(item.id);
		setShowModal(true);
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this news item?")) return;

		const item = news.find((n) => n.id === id);

		try {
			setDeleting(id);
			await apiClient.deleteNews(id);

			if (item?.imageUrl) {
				await deleteCloudinaryImage(item.imageUrl);
			}

			toast.success("News deleted successfully");
			await loadNews();
		} catch (error) {
			console.error("Error deleting news:", error);
			toast.error("Failed to delete news");
		} finally {
			setDeleting(null);
		}
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "General":
				return "bg-blue-100 text-blue-800";
			case "Announcement":
				return "bg-purple-100 text-purple-800";
			case "Event":
				return "bg-green-100 text-green-800";
			case "Achievement":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
							News Management
						</h1>
						<p className="text-gray-600 mt-1 text-sm sm:text-base">
							Create and manage news articles and announcements
						</p>
					</div>
					<div className="text-center sm:text-right">
						<div className="text-2xl sm:text-3xl font-bold text-green-600">
							{news.length}
						</div>
						<div className="text-xs sm:text-sm text-gray-500">
							Total Articles
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
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm sm:text-base"
					>
						<Plus className="w-4 h-4" />
						Add News
					</motion.button>
				</div>
			</div>

			{/* Content */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-8 sm:py-12">
						<div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
						<span className="ml-3 text-gray-600 text-sm sm:text-base">
							Loading news...
						</span>
					</div>
				) : news.length === 0 ? (
					<div className="text-center py-12 sm:py-16 px-4">
						<div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4">
							<Newspaper size={48} className="sm:w-16 sm:h-16" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
							No news articles yet
						</h3>
						<p className="text-gray-600 text-sm sm:text-base">
							Click "Add News" to create your first article.
						</p>
					</div>
				) : (
					<div className="p-4 sm:p-6">
						{news.length > 0 && (
							<div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4 text-green-600 shrink-0" />
									<p className="text-xs sm:text-sm text-green-800">
										<strong>Sorted by publish date</strong> - Most recent
										articles appear first
									</p>
								</div>
							</div>
						)}

						<div className="space-y-3 sm:space-y-4">
							{news.map((item, index) => (
								<motion.div
									key={item.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200"
								>
									<div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
										{/* Image */}
										{item.imageUrl ? (
											<Image
												src={item.imageUrl}
												alt={item.title}
												width={112}
												height={80}
												className="h-20 w-28 object-cover rounded-lg border border-gray-200 shrink-0"
											/>
										) : (
											<div className="h-20 w-28 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
												<Newspaper className="w-8 h-8 text-gray-400" />
											</div>
										)}

										{/* Content */}
										<div className="grow min-w-0">
											<h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
												{item.title}
											</h3>
											<p className="text-sm text-gray-600 line-clamp-2 mt-1">
												{item.content}
											</p>
											<div className="flex items-center gap-3 mt-3 flex-wrap">
												<span
													className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(
														item.category
													)}`}
												>
													<Tag className="w-3 h-3" />
													{item.category}
												</span>
												<span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
													<Calendar className="w-3 h-3" />
													{new Date(item.publishDate).toLocaleDateString(
														"en-IN",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														}
													)}
												</span>
												{index === 0 && (
													<span className="inline-flex px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
														Latest
													</span>
												)}
											</div>
										</div>

										{/* Actions */}
										<div className="flex gap-2 shrink-0">
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												onClick={() => handleEdit(item)}
												className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
											>
												<Edit className="w-4 h-4" />
												Edit
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												onClick={() => handleDelete(item.id)}
												disabled={deleting === item.id}
												className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
											>
												{deleting === item.id ? (
													<Loader2 className="w-4 h-4 animate-spin" />
												) : (
													<Trash2 className="w-4 h-4" />
												)}
												Delete
											</motion.button>
										</div>
									</div>
								</motion.div>
							))}
						</div>
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
							<div className="bg-linear-to-r from-green-600 to-green-700 px-4 sm:px-6 py-4 shrink-0">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg sm:text-xl font-semibold text-white">
											{editingId ? "Edit News Article" : "Create News Article"}
										</h3>
										<p className="text-green-100 text-xs sm:text-sm">
											Create and manage news articles and announcements
										</p>
									</div>
									<button
										onClick={() => setShowModal(false)}
										className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
									>
										<X className="w-5 h-5" />
									</button>
								</div>
							</div>

							{/* Modal Content */}
							<div className="flex-1 overflow-y-auto p-4 sm:p-6">
								<div className="space-y-4 sm:space-y-6">
									{/* Title & Slug */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Title <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												placeholder="Enter news title"
												value={formData.title}
												onChange={(e) => {
													const newTitle = e.target.value;
													setFormData({
														...formData,
														title: newTitle,
														slug:
															!editingId && !formData.slug
																? generateSlug(newTitle)
																: formData.slug,
													});
												}}
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												URL Slug
											</label>
											<input
												type="text"
												placeholder="auto-generated-from-title"
												value={formData.slug}
												onChange={(e) =>
													setFormData({ ...formData, slug: e.target.value })
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
											/>
											<p className="text-xs text-gray-500 mt-1">
												Leave empty to auto-generate
											</p>
										</div>
									</div>

									{/* Excerpt */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Excerpt / Summary <span className="text-red-500">*</span>
										</label>
										<textarea
											rows={3}
											placeholder="Brief summary for carousel and preview (200 characters recommended)"
											value={formData.excerpt}
											onChange={(e) =>
												setFormData({ ...formData, excerpt: e.target.value })
											}
											className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
										/>
									</div>

									{/* Detailed Article */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Detailed Article
										</label>
										<textarea
											rows={8}
											placeholder="Full detailed article content (supports HTML)"
											value={formData.detailedArticle}
											onChange={(e) =>
												setFormData({
													...formData,
													detailedArticle: e.target.value,
												})
											}
											className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
										/>
										<p className="text-xs text-gray-500 mt-1">
											You can use HTML tags for formatting
										</p>
									</div>

									{/* Primary Image */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Primary Image (for carousel)
										</label>
										<DeferredImageUpload
											previewUrl={formData.imageUrl}
											label="Upload Primary Image"
											onImageSelect={(file) => setPendingPrimaryImage(file)}
											onImageRemove={() => {
												setPendingPrimaryImage(null);
												setFormData({ ...formData, imageUrl: "" });
											}}
										/>
										{formData.imageUrl && !pendingPrimaryImage && (
											<p className="text-xs text-gray-600 mt-2">
												Current image will be kept unless you upload a new one
											</p>
										)}
									</div>

									{/* Additional Images */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Additional Images (Optional)
										</label>
										<div className="space-y-3">
											{/* Display already uploaded images */}
											{formData.images.map((img, index) => (
												<div
													key={`uploaded-${index}`}
													className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50"
												>
													<Image
														src={img}
														alt={`Additional ${index + 1}`}
														width={64}
														height={64}
														className="w-16 h-16 object-cover rounded"
													/>
													<input
														type="text"
														value={img}
														readOnly
														className="flex-1 p-2 border border-gray-300 rounded text-sm bg-white"
													/>
													<span className="text-xs text-green-600 px-2">
														Uploaded
													</span>
													<button
														type="button"
														onClick={() => removeImage(index)}
														className="p-2 text-red-600 hover:bg-red-50 rounded"
													>
														<X className="w-4 h-4" />
													</button>
												</div>
											))}

											{/* Display pending images to upload */}
											{pendingAdditionalImages.map((file, index) => (
												<div
													key={`pending-${index}`}
													className="flex items-center gap-2 p-2 border border-blue-200 rounded-lg bg-blue-50"
												>
													<div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center">
														<ImageIcon className="w-8 h-8 text-blue-600" />
													</div>
													<input
														type="text"
														value={file.name}
														readOnly
														className="flex-1 p-2 border border-gray-300 rounded text-sm bg-white"
													/>
													<span className="text-xs text-blue-600 px-2">
														Pending
													</span>
													<button
														type="button"
														onClick={() => {
															setPendingAdditionalImages(
																pendingAdditionalImages.filter(
																	(_, i) => i !== index
																)
															);
														}}
														className="p-2 text-red-600 hover:bg-red-50 rounded"
													>
														<X className="w-4 h-4" />
													</button>
												</div>
											))}

											{/* Add new image button */}
											<label className="cursor-pointer">
												<input
													type="file"
													accept="image/*"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) {
															// Validate file
															if (!file.type.startsWith("image/")) {
																toast.error("Please select an image file");
																return;
															}
															if (file.size > 10 * 1024 * 1024) {
																toast.error("File size must be less than 10MB");
																return;
															}
															setPendingAdditionalImages([
																...pendingAdditionalImages,
																file,
															]);
															// Reset input
															e.target.value = "";
														}
													}}
													className="hidden"
												/>
												<div className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors text-center cursor-pointer">
													<Upload className="w-5 h-5 inline-block mr-2" />
													Add Image
												</div>
											</label>
											<p className="text-xs text-gray-500 mt-1">
												Images will be uploaded when you click &quot;
												{editingId ? "Update News" : "Create News"}&quot;
											</p>
										</div>
									</div>

									{/* Links */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Links (Optional)
										</label>
										<div className="space-y-3">
											{formData.links.map((link, index) => (
												<div
													key={index}
													className="grid grid-cols-12 gap-2 p-3 border border-gray-200 rounded-lg"
												>
													<select
														value={link.type}
														onChange={(e) =>
															updateLink(index, "type", e.target.value)
														}
														className="col-span-3 p-2 border border-gray-300 rounded text-sm"
													>
														<option value="youtube">YouTube Video</option>
														<option value="youtube-playlist">YouTube Playlist</option>
														<option value="facebook">Facebook</option>
														<option value="instagram">Instagram</option>
														<option value="twitter">Twitter</option>
														<option value="custom">Custom</option>
													</select>
													<input
														type="text"
														placeholder={
															link.type === "youtube-playlist"
																? "https://www.youtube.com/playlist?list=..."
																: link.type === "youtube"
																? "https://www.youtube.com/watch?v=..."
																: "URL"
														}
														value={link.url}
														onChange={(e) =>
															updateLink(index, "url", e.target.value)
														}
														className="col-span-5 p-2 border border-gray-300 rounded text-sm"
													/>
													<input
														type="text"
														placeholder="Title"
														value={link.title}
														onChange={(e) =>
															updateLink(index, "title", e.target.value)
														}
														className="col-span-3 p-2 border border-gray-300 rounded text-sm"
													/>
													<button
														type="button"
														onClick={() => removeLink(index)}
														className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded"
													>
														<X className="w-4 h-4" />
													</button>
												</div>
											))}
											<button
												type="button"
												onClick={addLink}
												className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
											>
												+ Add Link
											</button>
											<p className="text-xs text-gray-500 mt-2">
												<strong>YouTube Playlists:</strong> Use the full playlist URL (e.g., https://www.youtube.com/playlist?list=PLxxxxxx)
											</p>
										</div>
									</div>

									{/* Category, Date, Published */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Category
											</label>
											<select
												value={formData.category}
												onChange={(e) =>
													setFormData({ ...formData, category: e.target.value })
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
											>
												<option value="General">General</option>
												<option value="Announcement">Announcement</option>
												<option value="Event">Event</option>
												<option value="Achievement">Achievement</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Publish Date
											</label>
											<input
												type="date"
												value={formData.publishDate}
												onChange={(e) =>
													setFormData({
														...formData,
														publishDate: e.target.value,
													})
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Status
											</label>
											<div className="flex items-center gap-4 p-3">
												<label className="flex items-center gap-2 cursor-pointer">
													<input
														type="radio"
														checked={formData.isPublished}
														onChange={() =>
															setFormData({ ...formData, isPublished: true })
														}
														className="w-4 h-4 text-green-600"
													/>
													<span className="text-sm flex items-center gap-1">
														<Eye className="w-4 h-4" />
														Published
													</span>
												</label>
												<label className="flex items-center gap-2 cursor-pointer">
													<input
														type="radio"
														checked={!formData.isPublished}
														onChange={() =>
															setFormData({ ...formData, isPublished: false })
														}
														className="w-4 h-4 text-gray-600"
													/>
													<span className="text-sm flex items-center gap-1">
														<EyeOff className="w-4 h-4" />
														Draft
													</span>
												</label>
											</div>
										</div>
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
											!formData.title.trim() ||
											!formData.excerpt.trim()
										}
										className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
									>
										{submitting && (
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										)}
										{editingId ? "Update News" : "Create News"}
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
