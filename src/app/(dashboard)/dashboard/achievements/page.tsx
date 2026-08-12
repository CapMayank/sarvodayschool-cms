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
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

export default function AchievementsTab() {
                                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [achievements, setAchievements] = useState<any[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<number | null>(null);
	const [isReordering, setIsReordering] = useState(false);
	const [originalImageUrl, setOriginalImageUrl] = useState("");
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
		setOriginalImageUrl("");
	};

	const handleCancel = () => {
		if (formData.imageUrl && formData.imageUrl !== originalImageUrl) {
			const publicIdMatch = formData.imageUrl.match(/\/v\d+\/(.+?)\.[a-zA-Z0-9]+$/);
			if (publicIdMatch) {
				const publicId = publicIdMatch[1];
				fetch("/api/cloudinary/delete", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ publicId }),
				}).catch(console.error);
			}
		}
		setShowModal(false);
		resetForm();
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
			if (formData.imageUrl && formData.imageUrl !== originalImageUrl) {
				const publicIdMatch = formData.imageUrl.match(/\/v\d+\/(.+?)\.[a-zA-Z0-9]+$/);
				if (publicIdMatch) {
					const publicId = publicIdMatch[1];
					fetch("/api/cloudinary/delete", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ publicId }),
					}).catch(console.error);
				}
			}
			toast.error("Failed to save achievement");
		} finally {
			setSubmitting(false);
		}
	};

                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleEdit = (achievement: any) => {
		setFormData({
			title: achievement.title,
			description: achievement.description,
			imageUrl: achievement.imageUrl,
			order: achievement.order,
		});
		setEditingId(achievement.id);
		setOriginalImageUrl(achievement.imageUrl);
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

                                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">Achievement Management</CardTitle>
						<CardDescription>
							Showcase your school&apos;s accomplishments and milestones
						</CardDescription>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-right hidden sm:block">
							<div className="text-2xl font-bold text-orange-600">
								{achievements.length}
							</div>
							<div className="text-xs text-muted-foreground">
								Total Achievements
							</div>
						</div>
						<Button
							className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
							onClick={() => {
								resetForm();
								setShowModal(true);
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							Add Achievement
						</Button>
					</div>
				</CardHeader>
			</Card>

			{/* Content */}
			<Card>
				<CardContent className="p-0">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-orange-600" />
							<span className="ml-3 text-muted-foreground">
								Loading achievements...
							</span>
						</div>
					) : achievements.length === 0 ? (
						<div className="text-center py-16 px-4">
							<div className="mx-auto h-16 w-16 text-muted-foreground mb-4">
								<Award size={48} className="w-full h-full" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No achievements yet
							</h3>
							<p className="text-muted-foreground">
								Click "Add Achievement" to create your first achievement.
							</p>
						</div>
					) : (
						<div className="p-6">
							{achievements.length > 0 && (
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

							<ReorderableList items={achievements} onReorder={handleReorder}>
								{(item, index) => (
									<Card className="mb-4 overflow-hidden hover:shadow-md transition-all duration-200">
										<div className="flex flex-col sm:flex-row items-start gap-4 p-4">
											{/* Image */}
											<Image
												src={item.imageUrl}
												alt={item.title}
												width={80}
												height={80}
												className="h-20 w-20 object-cover rounded-lg border shrink-0 mx-auto sm:mx-0"
											/>

											{/* Content */}
											<div className="flex-grow min-w-0 text-center sm:text-left">
												<h3 className="font-semibold text-lg">
													{item.title}
												</h3>
												<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
													{item.description}
												</p>
												<div className="mt-3">
													<Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
														Position #{index + 1}
													</Badge>
												</div>
											</div>

											{/* Actions */}
											<div className="flex gap-2 shrink-0 w-full sm:w-auto justify-center sm:justify-start mt-4 sm:mt-0">
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
									</Card>
								)}
							</ReorderableList>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sheet Modal */}
			<Sheet open={showModal} onOpenChange={(open) => {
				if (!open) handleCancel();
			}}>
				<SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
					<SheetHeader className="mb-6">
						<SheetTitle className="text-2xl">
							{editingId ? "Edit Achievement" : "Create New Achievement"}
						</SheetTitle>
						<SheetDescription>
							Showcase your school&apos;s accomplishments and milestones
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-6 pb-20">
						<div>
							<Label className="mb-2 block">
								Title <span className="text-red-500">*</span>
							</Label>
							<Input
								placeholder="Enter achievement title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
							/>
						</div>

						<div>
							<Label className="mb-2 block">
								Description <span className="text-red-500">*</span>
							</Label>
							<Textarea
								placeholder="Enter achievement description"
								value={formData.description}
								onChange={(e) =>
									setFormData({
										...formData,
										description: e.target.value,
									})
								}
								rows={4}
								className="resize-none"
							/>
						</div>

						<div>
							<Label className="mb-2 block">
								Image <span className="text-red-500">*</span>
							</Label>
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

					<SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex sm:justify-end gap-3">
						<Button variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
						<Button
							className="bg-orange-600 hover:bg-orange-700"
							onClick={handleSubmit}
							disabled={
								submitting ||
								!formData.imageUrl ||
								!formData.title.trim() ||
								!formData.description.trim()
							}
						>
							{submitting && (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							)}
							{editingId ? "Update Achievement" : "Create Achievement"}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
