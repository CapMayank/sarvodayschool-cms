/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { deleteCloudinaryImage } from "@/lib/cloudinary-helper";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
	Plus,
	Loader2,
	Edit,
	Trash2,
	Calendar,
	Tag,
	Newspaper,
} from "lucide-react";

export default function NewsTab() {
	const [news, setNews] = useState<any[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<number | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		content: "",
		imageUrl: "",
		category: "General",
		publishDate: new Date().toISOString().split("T")[0],
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
			content: "",
			imageUrl: "",
			category: "General",
			publishDate: new Date().toISOString().split("T")[0],
		});
		setEditingId(null);
	};

	const handleSubmit = async () => {
		if (!formData.title.trim()) {
			toast.error("Please enter a title");
			return;
		}

		if (!formData.content.trim()) {
			toast.error("Please enter content");
			return;
		}

		try {
			setSubmitting(true);

			if (editingId) {
				await apiClient.updateNews(editingId, formData);
				toast.success("News updated successfully");
			} else {
				await apiClient.createNews(formData);
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
			content: item.content,
			imageUrl: item.imageUrl || "",
			category: item.category,
			publishDate: new Date(item.publishDate).toISOString().split("T")[0],
		});
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
											<img
												src={item.imageUrl}
												alt={item.title}
												className="h-20 w-28 object-cover rounded-lg border border-gray-200 flex-shrink-0"
											/>
										) : (
											<div className="h-20 w-28 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
												<Newspaper className="w-8 h-8 text-gray-400" />
											</div>
										)}

										{/* Content */}
										<div className="flex-grow min-w-0">
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
										<div className="flex gap-2 flex-shrink-0">
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
							className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-2"
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
											Title <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											placeholder="Enter news title"
											value={formData.title}
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Content <span className="text-red-500">*</span>
										</label>
										<textarea
											rows={6}
											placeholder="Write news content..."
											value={formData.content}
											onChange={(e) =>
												setFormData({ ...formData, content: e.target.value })
											}
											className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Image (Optional)
										</label>
										<CloudinaryUpload
											currentImage={formData.imageUrl}
											folder="sarvodaya/news"
											onUploadSuccess={(url) =>
												setFormData({ ...formData, imageUrl: url })
											}
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Category
											</label>
											<select
												value={formData.category}
												onChange={(e) =>
													setFormData({ ...formData, category: e.target.value })
												}
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
												className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
											/>
										</div>
									</div>

									<div className="bg-gray-50 rounded-lg p-4">
										<p className="text-xs text-gray-600">
											<strong>Note:</strong> News articles are sorted by publish
											date with the most recent appearing first.
										</p>
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
											!formData.content.trim()
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
