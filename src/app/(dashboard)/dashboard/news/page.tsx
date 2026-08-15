/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Pagination } from "@/components/Pagination";
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

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsTab() {
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [news, setNews] = useState<any[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

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

	const loadNews = async (page: number) => {
		try {
			setLoading(true);
			const response = await apiClient.getNews(page, 12);
			const data = response.data;
			setTotalPages(response.meta.totalPages);
			const sorted = data.sort(
                 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		loadNews(currentPage);
	}, [currentPage]);

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

		let uploadedPrimaryImageUrl = formData.imageUrl;
		let uploadedAdditionalImages = [...formData.images];
		const rollbackImageUrls: string[] = []; // Track new uploads for rollback

		try {
			setSubmitting(true);

			// Upload primary image if a new file is selected
			if (pendingPrimaryImage) {
				toast.info("Uploading primary image...");
				try {
					uploadedPrimaryImageUrl = await uploadToCloudinary(
						pendingPrimaryImage,
						"sarvodaya/news"
					);
					if (uploadedPrimaryImageUrl) {
						rollbackImageUrls.push(uploadedPrimaryImageUrl);
					}
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
					
					newImageUrls.forEach(url => {
						if (url) rollbackImageUrls.push(url);
					});

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
				const updated = await apiClient.updateNews(editingId, submitData);
				setNews((prev) => prev.map((n) => (n.id === editingId ? { ...n, ...updated } : n)).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()));
				toast.success("News updated successfully");
			} else {
				const created = await apiClient.createNews(submitData);
				setNews((prev) => [...prev, created].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()));
				toast.success("News created successfully");
			}

			setShowModal(false);
			resetForm();
		} catch (err) {
			console.error("Error saving news:", err);
			toast.error("Failed to save news. Rolling back images...");
			
			// Rollback any newly uploaded images on API failure
			for (const url of rollbackImageUrls) {
				try {
					await deleteCloudinaryImage(url);
				} catch (rollbackErr) {
					console.error("Failed to rollback image:", rollbackErr);
				}
			}
		} finally {
			setSubmitting(false);
		}
	};

                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
			setNews((prev) => prev.filter((n) => n.id !== id));
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
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">News Management</CardTitle>
						<CardDescription>
							Create and manage news articles and announcements
						</CardDescription>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-right hidden sm:block">
							<div className="text-2xl font-bold text-green-600">
								{news.length}
							</div>
							<div className="text-xs text-muted-foreground">Total Articles</div>
						</div>
						<Button
							className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
							onClick={() => {
								resetForm();
								setShowModal(true);
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							Add News
						</Button>
					</div>
				</CardHeader>
			</Card>

			{/* Content */}
			<Card>
				<CardContent className="p-0">
					{loading ? (
						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<Card key={i} className="overflow-hidden flex flex-col">
										<Skeleton className="h-48 w-full rounded-none" />
										<CardContent className="p-4 space-y-4">
											<div className="flex justify-between">
												<Skeleton className="h-5 w-20" />
												<Skeleton className="h-5 w-16" />
											</div>
											<Skeleton className="h-6 w-3/4" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-5/6" />
											<Skeleton className="h-4 w-32 mt-4" />
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					) : news.length === 0 ? (
						<div className="text-center py-16 px-4">
							<div className="mx-auto h-16 w-16 text-muted-foreground mb-4">
								<Newspaper size={48} className="w-full h-full" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No news articles yet
							</h3>
							<p className="text-muted-foreground">
								Click "Add News" to create your first article.
							</p>
						</div>
					) : (
						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
								{news.map((item, index) => (
									<Card key={item.id} className="overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
										{/* Image */}
										{item.imageUrl ? (
											<div className="relative h-48 w-full border-b">
												<Image
													src={item.imageUrl}
													alt={item.title}
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="h-48 w-full bg-muted flex items-center justify-center border-b">
												<Newspaper className="w-12 h-12 text-muted-foreground/50" />
											</div>
										)}

										<CardContent className="p-4 flex-grow flex flex-col">
											<div className="flex items-center justify-between gap-2 mb-2">
												<Badge variant="secondary" className={getCategoryColor(item.category)}>
													<Tag className="w-3 h-3 mr-1" />
													{item.category}
												</Badge>
												{index === 0 && (
													<Badge variant="outline" className="text-green-600 border-green-600">
														Latest
													</Badge>
												)}
											</div>
											<h3 className="font-semibold text-lg line-clamp-2 mb-2">
												{item.title}
											</h3>
											<p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
												{item.excerpt || item.content}
											</p>
											
											<div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
												<Calendar className="w-4 h-4" />
												{new Date(item.publishDate).toLocaleDateString(
													"en-IN",
													{
														year: "numeric",
														month: "short",
														day: "numeric",
													}
												)}
											</div>
										</CardContent>

										<div className="p-4 border-t bg-muted/30 flex gap-2">
											<Button
												variant="outline"
												className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
												onClick={() => handleEdit(item)}
											>
												<Edit className="w-4 h-4 mr-2" />
												Edit
											</Button>
											<Button
												variant="outline"
												className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
												onClick={() => handleDelete(item.id)}
												disabled={deleting === item.id}
											>
												{deleting === item.id ? (
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												) : (
													<Trash2 className="w-4 h-4 mr-2" />
												)}
												Delete
											</Button>
										</div>
									</Card>
								))}
							</div>
						</div>
					)}
					{!loading && news.length > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
					)}
				</CardContent>
			</Card>

			{/* Sheet Modal */}
			<Sheet open={showModal} onOpenChange={setShowModal}>
				<SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col h-full" side="right">
					<SheetHeader className="px-6 pt-6 pb-2 border-b">
						<SheetTitle className="text-2xl">
							{editingId ? "Edit News Article" : "Create News Article"}
						</SheetTitle>
						<SheetDescription>
							Fill in the details for the news article.
						</SheetDescription>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto">
						<div className="space-y-8 p-6">
						{/* Basic Information Section */}
						<div className="space-y-4 bg-muted/10 p-5 rounded-xl border">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								<Newspaper className="w-5 h-5 text-blue-500" />
								Basic Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Title <span className="text-red-500">*</span></Label>
									<Input
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
									/>
								</div>
								<div className="space-y-2">
									<Label>URL Slug</Label>
									<Input
										placeholder="auto-generated-from-title"
										value={formData.slug}
										onChange={(e) =>
											setFormData({ ...formData, slug: e.target.value })
										}
									/>
									<p className="text-xs text-muted-foreground">
										Leave empty to auto-generate
									</p>
								</div>
							</div>
						</div>

						{/* Content Section */}
						<div className="space-y-4 bg-muted/10 p-5 rounded-xl border">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								<Edit className="w-5 h-5 text-green-500" />
								Content
							</h3>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Excerpt / Summary <span className="text-red-500">*</span></Label>
									<Textarea
										rows={3}
										placeholder="Brief summary for carousel and preview (200 characters recommended)"
										value={formData.excerpt}
										onChange={(e) =>
											setFormData({ ...formData, excerpt: e.target.value })
										}
										className="resize-none"
									/>
								</div>
								<div className="space-y-2">
									<Label>Detailed Article</Label>
									<Textarea
										rows={8}
										placeholder="Full detailed article content (supports HTML)"
										value={formData.detailedArticle}
										onChange={(e) =>
											setFormData({
												...formData,
												detailedArticle: e.target.value,
											})
										}
										className="resize-none font-mono text-sm"
									/>
									<p className="text-xs text-muted-foreground">
										You can use HTML tags for formatting
									</p>
								</div>
							</div>
						</div>

						{/* Media Section */}
						<div className="space-y-4 bg-muted/10 p-5 rounded-xl border">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								<ImageIcon className="w-5 h-5 text-purple-500" />
								Media
							</h3>
							<div className="space-y-6">
								<div className="space-y-2">
									<Label>Primary Image (for carousel)</Label>
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
										<p className="text-xs text-muted-foreground">
											Current image will be kept unless you upload a new one
										</p>
									)}
								</div>

								<div className="space-y-2 border-t pt-4">
									<Label>Additional Images (Optional)</Label>
									<div className="space-y-3">
										{/* Display already uploaded images */}
										{formData.images.map((img, index) => (
											<div
												key={`uploaded-${index}`}
												className="flex items-center gap-3 p-3 border rounded-lg bg-background shadow-sm"
											>
												<Image
													src={img}
													alt={`Additional ${index + 1}`}
													width={48}
													height={48}
													className="w-12 h-12 object-cover rounded-md"
												/>
												<Input
													value={img}
													readOnly
													className="flex-1 bg-muted/50 text-sm h-8"
												/>
												<Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 hidden sm:inline-flex">
													Uploaded
												</Badge>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeImage(index)}
													className="text-red-600 hover:bg-red-50 hover:text-red-700"
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										))}

										{/* Display pending images to upload */}
										{pendingAdditionalImages.map((file, index) => (
											<div
												key={`pending-${index}`}
												className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/50 shadow-sm"
											>
												<div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
													<ImageIcon className="w-6 h-6 text-blue-600" />
												</div>
												<Input
													value={file.name}
													readOnly
													className="flex-1 bg-background text-sm h-8"
												/>
												<Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hidden sm:inline-flex">
													Pending
												</Badge>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => {
														setPendingAdditionalImages(
															pendingAdditionalImages.filter(
																(_, i) => i !== index
															)
														);
													}}
													className="text-red-600 hover:bg-red-50 hover:text-red-700"
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										))}

										{/* Add new image button */}
										<Label className="cursor-pointer block">
											<input
												type="file"
												accept="image/*"
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) {
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
														e.target.value = "";
													}
												}}
												className="hidden"
											/>
											<div className="w-full p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors text-center cursor-pointer flex flex-col items-center justify-center gap-2">
												<Upload className="w-6 h-6" />
												<span className="text-sm font-medium">Click to add an additional image</span>
											</div>
										</Label>
										<p className="text-xs text-muted-foreground text-center">
											Images will be uploaded when you save the article
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Links Section */}
						<div className="space-y-4 bg-muted/10 p-5 rounded-xl border">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								<Tag className="w-5 h-5 text-orange-500" />
								Links (Optional)
							</h3>
							<div className="space-y-3">
								{formData.links.map((link, index) => (
									<div
										key={index}
										className="flex flex-col sm:flex-row gap-2 p-3 border rounded-lg bg-background shadow-sm"
									>
										<select
											value={link.type}
											onChange={(e) =>
												updateLink(index, "type", e.target.value)
											}
											className="flex h-9 w-full sm:w-1/4 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
										>
											<option value="youtube">YouTube Video</option>
											<option value="youtube-playlist">
												YouTube Playlist
											</option>
											<option value="facebook">Facebook</option>
											<option value="instagram">Instagram</option>
											<option value="twitter">Twitter</option>
											<option value="custom">Custom</option>
										</select>
										<Input
											placeholder={
												link.type === "youtube-playlist"
													? "https://youtube.com/playlist?list=..."
													: link.type === "youtube"
													? "https://youtube.com/watch?v=..."
													: "URL"
											}
											value={link.url}
											onChange={(e) =>
												updateLink(index, "url", e.target.value)
											}
											className="flex-1"
										/>
										<Input
											placeholder="Title"
											value={link.title}
											onChange={(e) =>
												updateLink(index, "title", e.target.value)
											}
											className="sm:w-1/4"
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => removeLink(index)}
											className="text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0"
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									className="w-full border-dashed"
									onClick={addLink}
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Link
								</Button>
							</div>
						</div>

						{/* Settings Section */}
						<div className="space-y-4 bg-muted/10 p-5 rounded-xl border">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								<Calendar className="w-5 h-5 text-red-500" />
								Publish Settings
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label>Category</Label>
									<Select
										value={formData.category}
										onValueChange={(val) => setFormData({ ...formData, category: val })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select Category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="General">General</SelectItem>
											<SelectItem value="Announcement">Announcement</SelectItem>
											<SelectItem value="Event">Event</SelectItem>
											<SelectItem value="Achievement">Achievement</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>Publish Date</Label>
									<Input
										type="date"
										value={formData.publishDate}
										onChange={(e) =>
											setFormData({
												...formData,
												publishDate: e.target.value,
											})
										}
									/>
								</div>

								<div className="space-y-2">
									<Label>Status</Label>
									<div className="flex items-center flex-wrap gap-4 min-h-10 py-2 px-3 border rounded-md bg-background">
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
					</div>

						<SheetFooter className="p-4 bg-background border-t flex sm:justify-end gap-3 shrink-0">
							<Button variant="outline" onClick={() => setShowModal(false)}>
								Cancel
							</Button>
							<Button 
								className="bg-green-600 hover:bg-green-700" 
								onClick={handleSubmit} 
								disabled={submitting || !formData.title.trim() || !formData.excerpt.trim()}
							>
								{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
								{editingId ? "Update News" : "Create News"}
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
		</div>
	);
}
