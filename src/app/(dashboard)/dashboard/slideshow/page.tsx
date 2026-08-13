/** @format */

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { deleteCloudinaryImage } from "@/lib/cloudinary-helper";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import ReorderableList from "@/components/ReorderableList";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	Loader2,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
	Eye,
	Edit,
	Trash2,
	Image as ImageIcon,
	GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

export default function SlideshowsTab() {
                                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [slideshows, setSlideshows] = useState<any[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<number | null>(null);
	const [isReordering, setIsReordering] = useState(false);
	const [originalImageUrl, setOriginalImageUrl] = useState("");
	const [formData, setFormData] = useState({
		title: "",
		imageUrl: "",
		isActive: true,
		order: 0,
	});

	useEffect(() => {
		loadSlideshows();
	}, []);

	const loadSlideshows = async () => {
		try {
			setLoading(true);
			const data = await apiClient.getSlideshows();
			setSlideshows(data);
		} catch (error) {
			console.error("Error loading slideshows:", error);
			toast.error("Failed to load slideshows");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			imageUrl: "",
			isActive: true,
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

		try {
			setSubmitting(true);

			if (editingId) {
				await apiClient.updateSlideshow(editingId, formData);
				toast.success("Slideshow updated successfully");
			} else {
				await apiClient.createSlideshow(formData);
				toast.success("Slideshow created successfully");
			}

			setShowModal(false);
			resetForm();
			await loadSlideshows();
		} catch (error) {
			console.error("Error saving slideshow:", error);
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
			toast.error("Failed to save slideshow");
		} finally {
			setSubmitting(false);
		}
	};

                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleEdit = (slideshow: any) => {
		setFormData({
			title: slideshow.title || "",
			imageUrl: slideshow.imageUrl,
			isActive: slideshow.isActive,
			order: slideshow.order,
		});
		setEditingId(slideshow.id);
		setOriginalImageUrl(slideshow.imageUrl);
		setShowModal(true);
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this slideshow?")) return;

		const slideshow = slideshows.find((s) => s.id === id);

		try {
			setDeleting(id);
			await apiClient.deleteSlideshow(id);

			if (slideshow?.imageUrl) {
				await deleteCloudinaryImage(slideshow.imageUrl);
			}

			toast.success("Slideshow deleted successfully");
			await loadSlideshows();
		} catch (error) {
			console.error("Error deleting slideshow:", error);
			toast.error("Failed to delete slideshow");
		} finally {
			setDeleting(null);
		}
	};

                                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleReorder = async (reorderedItems: any[]) => {
		try {
			const res = await fetch("/api/slideshows", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(
					reorderedItems.map(({ id, order }: { id: number; order: number }) => ({ id, order }))
				),
			});
			if (!res.ok) throw new Error("Failed to reorder");
			setSlideshows(reorderedItems);
		} catch (error) {
			console.error("Error reordering:", error);
			toast.error("Failed to update order");
			throw error;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<CardTitle className="text-2xl">Slideshow Management</CardTitle>
						<CardDescription>
							Manage banner images for your website homepage
						</CardDescription>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-right hidden sm:block">
							<div className="text-2xl font-bold text-blue-600">
								{slideshows.length}
							</div>
							<div className="text-xs text-muted-foreground">Total Slides</div>
						</div>
						<Button
							className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
							onClick={() => {
								resetForm();
								setShowModal(true);
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							Add Slideshow
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
								Loading slideshows...
							</span>
						</div>
					) : slideshows.length === 0 ? (
						<div className="text-center py-16 px-4">
							<div className="mx-auto h-16 w-16 text-muted-foreground mb-4">
								<ImageIcon size={48} className="w-full h-full" />
							</div>
							<h3 className="text-lg font-semibold text-foreground mb-2">
								No slideshows yet
							</h3>
							<p className="text-muted-foreground">
								Click "Add Slideshow" to create your first banner.
							</p>
						</div>
					) : (
						<div className="p-6">
							{slideshows.length > 0 && (
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

							<ReorderableList items={slideshows} onReorder={handleReorder}>
								{(item, index) => (
									<div className="flex flex-col sm:flex-row items-center gap-4 w-full">
											{/* Image */}
											<div className="relative shrink-0 w-full sm:w-auto">
												<Image
													src={item.imageUrl}
													alt={item.title || "Slideshow"}
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
													{item.title || "Untitled Banner"}
												</h3>
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
				if (!open) handleCancel();
			}}>
				<SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
					<SheetHeader className="mb-6">
						<SheetTitle className="text-2xl">
							{editingId ? "Edit Slideshow" : "Create New Slideshow"}
						</SheetTitle>
						<SheetDescription>
							Add banner images to display on your website homepage
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-6 pb-20">
						<div>
							<Label className="mb-2 block">
								Title (Optional)
							</Label>
							<Input
								placeholder="Enter banner title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
							/>
						</div>

						<div>
							<Label className="mb-2 block">
								Banner Image <span className="text-red-500">*</span>
							</Label>
							<CloudinaryUpload
								currentImage={formData.imageUrl}
								folder="sarvodaya/slideshows"
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
										Only active slideshows will be displayed on the
										website
									</p>
								</div>
							</label>
						</div>
					</div>

					<SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex sm:justify-end gap-3">
						<Button variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
						<Button
							className="bg-blue-600 hover:bg-blue-700"
							onClick={handleSubmit}
							disabled={submitting || !formData.imageUrl}
						>
							{submitting && (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							)}
							{editingId ? "Update Slideshow" : "Create Slideshow"}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
