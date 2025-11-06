/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { deleteCloudinaryImage } from "@/lib/cloudinary-helper";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import ReorderableList from "@/components/ReorderableList";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Edit, Trash2, Award, GripVertical } from "lucide-react";
import { toast } from "sonner";

export default function AchievementsTab() {
	const [achievements, setAchievements] = useState<any[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<number | null>(null);
	const [isReordering, setIsReordering] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		imageUrl: "",
		order: 0,
	});

	useEffect(() => {
		loadAchievements();
	}, []);

	const loadAchievements = async () => {
		try {
			setLoading(true);
			const data = await apiClient.getAchievements();
			setAchievements(data);
		} catch (error) {
			console.error("Error loading achievements:", error);
			toast.error("Failed to load achievements");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			imageUrl: "",
			order: 0,
		});
		setEditingId(null);
	};

	const handleSubmit = async () => {
		if (!formData.imageUrl) {
			toast.error("Please upload an image");
			return;
		}

		if (!formData.title.trim()) {
			toast.error("Please enter a title");
			return;
		}

		if (!formData.description.trim()) {
			toast.error("Please enter a description");
			return;
		}

		try {
			setSubmitting(true);

			if (editingId) {
				await apiClient.updateAchievement(editingId, formData);
				toast.success("Achievement updated successfully");
			} else {
				await apiClient.createAchievement(formData);
				toast.success("Achievement created successfully");
			}

			setShowModal(false);
			resetForm();
			await loadAchievements();
		} catch (error) {
			console.error("Error saving achievement:", error);
			toast.error("Failed to save achievement");
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (achievement: any) => {
		setFormData({
			title: achievement.title,
			description: achievement.description,
			imageUrl: achievement.imageUrl,
			order: achievement.order,
		});
		setEditingId(achievement.id);
		setShowModal(true);
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this achievement?")) return;

		const achievement = achievements.find((a) => a.id === id);

		try {
			setDeleting(id);
			await apiClient.deleteAchievement(id);

			if (achievement?.imageUrl) {
				await deleteCloudinaryImage(achievement.imageUrl);
			}

			toast.success("Achievement deleted successfully");
			await loadAchievements();
		} catch (error) {
			console.error("Error deleting achievement:", error);
			toast.error("Failed to delete achievement");
		} finally {
			setDeleting(null);
		}
	};

	const handleReorder = async (reorderedItems: any[]) => {
		setIsReordering(true);
		try {
			for (const item of reorderedItems) {
				await apiClient.updateAchievement(item.id, {
					title: item.title,
					description: item.description,
					imageUrl: item.imageUrl,
					order: item.order,
				});
			}
			setAchievements(reorderedItems);
			toast.success("Order updated successfully");
		} catch (error) {
			console.error("Error reordering:", error);
			toast.error("Failed to update order");
			await loadAchievements();
		} finally {
			setIsReordering(false);
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Header */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
							Achievement Management
						</h1>
						<p className="text-gray-600 mt-1 text-sm sm:text-base">
							Showcase your school's accomplishments and milestones
						</p>
					</div>
					<div className="text-center sm:text-right">
						<div className="text-2xl sm:text-3xl font-bold text-orange-600">
							{achievements.length}
						</div>
						<div className="text-xs sm:text-sm text-gray-500">
							Total Achievements
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
						className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors text-sm sm:text-base"
					>
						<Plus className="w-4 h-4" />
						Add Achievement
					</motion.button>
				</div>
			</div>

			{/* Content */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-8 sm:py-12">
						<div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-600"></div>
						<span className="ml-3 text-gray-600 text-sm sm:text-base">
							Loading achievements...
						</span>
					</div>
				) : achievements.length === 0 ? (
					<div className="text-center py-12 sm:py-16 px-4">
						<div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4">
							<Award size={48} className="sm:w-16 sm:h-16" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
							No achievements yet
						</h3>
						<p className="text-gray-600 text-sm sm:text-base">
							Click "Add Achievement" to create your first achievement.
						</p>
					</div>
				) : (
					<div className="p-4 sm:p-6">
						{achievements.length > 0 && (
							<div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
								<div className="flex items-center gap-2">
									<GripVertical className="w-4 h-4 text-orange-600 shrink-0" />
									<p className="text-xs sm:text-sm text-orange-800">
										<strong>Tip:</strong> Drag items to reorder them. Changes
										are saved automatically.
									</p>
								</div>
							</div>
						)}

						<ReorderableList items={achievements} onReorder={handleReorder}>
							{(item, index) => (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200"
								>
									<div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
										{/* Image */}
										<img
											src={item.imageUrl}
											alt={item.title}
											className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border border-gray-200 shrink-0 mx-auto sm:mx-0"
										/>

										{/* Content */}
										<div className="flex-grow min-w-0 text-center sm:text-left">
											<h3 className="font-semibold text-gray-900 text-base sm:text-lg">
												{item.title}
											</h3>
											<p className="text-sm text-gray-600 line-clamp-2 mt-1">
												{item.description}
											</p>
											<div className="mt-2 sm:mt-3">
												<span className="inline-flex px-2 sm:px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium">
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
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col mx-4"
						>
							{/* Modal Header */}
							<div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 sm:px-6 py-4 shrink-0">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg sm:text-xl font-semibold text-white">
											{editingId
												? "Edit Achievement"
												: "Create New Achievement"}
										</h3>
										<p className="text-orange-100 text-xs sm:text-sm">
											Showcase your school's accomplishments and milestones
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
											placeholder="Enter achievement title"
											value={formData.title}
											onChange={(e) =>
												setFormData({ ...formData, title: e.target.value })
											}
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Description <span className="text-red-500">*</span>
										</label>
										<textarea
											placeholder="Enter achievement description"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											rows={4}
											className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Image <span className="text-red-500">*</span>
										</label>
										<CloudinaryUpload
											currentImage={formData.imageUrl}
											folder="sarvodaya/achievements"
											onUploadSuccess={(url) =>
												setFormData({ ...formData, imageUrl: url })
											}
										/>
										{!formData.imageUrl && (
											<p className="text-red-500 text-xs mt-2">
												Image is required
											</p>
										)}
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
											!formData.imageUrl ||
											!formData.title.trim() ||
											!formData.description.trim()
										}
										className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center text-sm sm:text-base"
									>
										{submitting && (
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										)}
										{editingId ? "Update Achievement" : "Create Achievement"}
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
