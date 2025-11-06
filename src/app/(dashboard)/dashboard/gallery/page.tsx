/** @format */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	Trash2,
	Upload,
	Edit2,
	Loader2,
	AlertCircle,
	ImageIcon,
	Youtube,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import ReorderableList from "@/components/ReorderableList";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GalleryCategory {
	id: number;
	name: string;
	title: string;
	description: string;
	order: number;
}

interface PlaylistVideo {
	id: number;
	youtubeId: string;
	title: string;
	order: number;
}

export default function GalleryTab() {
	// Categories State
	const [categories, setCategories] = useState<GalleryCategory[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [editingCategory, setEditingCategory] =
		useState<GalleryCategory | null>(null);
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const [imageCounts, setImageCounts] = useState<Record<number, number>>({});
	const [categoryFormData, setCategoryFormData] = useState({
		title: "",
		description: "",
	});

	// Playlists State
	const [playlists, setPlaylists] = useState<PlaylistVideo[]>([]);
	const [loadingPlaylists, setLoadingPlaylists] = useState(true);
	const [editingPlaylist, setEditingPlaylist] = useState<PlaylistVideo | null>(
		null
	);
	const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
	const [playlistFormData, setPlaylistFormData] = useState({
		title: "",
		youtubeId: "",
	});

	// Fetch Categories
	const fetchCategories = async () => {
		try {
			const res = await fetch("/api/admin/gallery");
			if (!res.ok) throw new Error("Failed to fetch categories");
			const data = await res.json();
			setCategories(data.categories);

			// Fetch image counts
			data.categories.forEach((cat: GalleryCategory) => {
				fetchImageCount(cat.id, cat.name);
			});
		} catch {
			toast.error("Failed to load categories");
		} finally {
			setLoadingCategories(false);
		}
	};

	// Fetch Playlists
	const fetchPlaylists = async () => {
		try {
			const res = await fetch("/api/admin/playlists");
			if (!res.ok) throw new Error("Failed to fetch playlists");
			const data = await res.json();
			setPlaylists(data.playlists);
		} catch {
			toast.error("Failed to load playlists");
		} finally {
			setLoadingPlaylists(false);
		}
	};

	useEffect(() => {
		fetchCategories();
		fetchPlaylists();
	}, []);

	// Fetch Image Count
	const fetchImageCount = async (id: number, name: string) => {
		try {
			const res = await fetch(`/api/admin/gallery/${id}`);
			if (res.ok) {
				const data = await res.json();
				setImageCounts((prev) => ({
					...prev,
					[id]: data.imageCount || 0,
				}));
			}
		} catch (error) {
			console.error("Error fetching image count:", error);
		}
	};

	// Category Actions
	const handleCategorySubmit = async () => {
		try {
			if (editingCategory) {
				const res = await fetch(`/api/admin/gallery/${editingCategory.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(categoryFormData),
				});
				if (!res.ok) throw new Error();

				const data = await res.json();
				setCategories(
					categories.map((cat) =>
						cat.id === editingCategory.id ? data.category : cat
					)
				);
				toast.success("Category updated successfully");
			} else {
				const res = await fetch("/api/admin/gallery", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(categoryFormData),
				});
				if (!res.ok) throw new Error();

				const data = await res.json();
				setCategories([...categories, data.category]);
				toast.success("Category created successfully");
			}
			setCategoryDialogOpen(false);
			resetCategoryForm();
		} catch {
			toast.error(
				editingCategory
					? "Failed to update category"
					: "Failed to create category"
			);
		}
	};

	const handleDeleteCategory = async (id: number) => {
		if (!confirm("Are you sure you want to delete this category?")) return;

		try {
			const res = await fetch(`/api/admin/gallery/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error();

			setCategories(categories.filter((cat) => cat.id !== id));
			toast.success("Category deleted successfully");
		} catch {
			toast.error("Failed to delete category");
		}
	};

	// Playlist Actions
	const handlePlaylistSubmit = async () => {
		try {
			if (editingPlaylist) {
				const res = await fetch(`/api/admin/playlists/${editingPlaylist.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(playlistFormData),
				});
				if (!res.ok) throw new Error();

				const data = await res.json();
				setPlaylists(
					playlists.map((p) =>
						p.id === editingPlaylist.id ? data.playlist : p
					)
				);
				toast.success("Playlist updated successfully");
			} else {
				const res = await fetch("/api/admin/playlists", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(playlistFormData),
				});
				if (!res.ok) throw new Error();

				const data = await res.json();
				setPlaylists([...playlists, data.playlist]);
				toast.success("Playlist created successfully");
			}
			setPlaylistDialogOpen(false);
			resetPlaylistForm();
		} catch {
			toast.error(
				editingPlaylist
					? "Failed to update playlist"
					: "Failed to create playlist"
			);
		}
	};

	const handleDeletePlaylist = async (id: number) => {
		if (!confirm("Are you sure you want to delete this playlist?")) return;

		try {
			const res = await fetch(`/api/admin/playlists/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error();

			setPlaylists(playlists.filter((p) => p.id !== id));
			toast.success("Playlist deleted successfully");
		} catch {
			toast.error("Failed to delete playlist");
		}
	};

	// Form Reset Helpers
	const resetCategoryForm = () => {
		setCategoryFormData({ title: "", description: "" });
		setEditingCategory(null);
	};

	const resetPlaylistForm = () => {
		setPlaylistFormData({ title: "", youtubeId: "" });
		setEditingPlaylist(null);
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			<Tabs defaultValue="images" className="space-y-4 sm:space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<TabsList className="w-full sm:w-auto">
						<TabsTrigger value="images" className="gap-2 flex-1 sm:flex-none">
							<ImageIcon className="h-4 w-4" />
							<span className="hidden sm:inline">Image Gallery</span>
							<span className="sm:hidden">Images</span>
						</TabsTrigger>
						<TabsTrigger value="videos" className="gap-2 flex-1 sm:flex-none">
							<Youtube className="h-4 w-4" />
							<span className="hidden sm:inline">Video Playlists</span>
							<span className="sm:hidden">Videos</span>
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="images" className="space-y-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<h2 className="text-xl sm:text-2xl font-bold">Image Categories</h2>

						<Dialog
							open={categoryDialogOpen}
							onOpenChange={setCategoryDialogOpen}
						>
							<DialogTrigger asChild>
								<Button
									onClick={resetCategoryForm}
									className="w-full sm:w-auto"
								>
									<Plus className="mr-2 h-4 w-4" /> Add Category
								</Button>
							</DialogTrigger>
							<DialogContent className="mx-4 max-w-lg">
								<DialogHeader>
									<DialogTitle className="text-lg sm:text-xl">
										{editingCategory ? "Edit Category" : "Create Category"}
									</DialogTitle>
									<DialogDescription className="text-sm sm:text-base">
										{editingCategory
											? "Update the category details below"
											: "Add a new category to organize your images"}
									</DialogDescription>
								</DialogHeader>

								<div className="grid gap-4 py-4">
									<div className="space-y-2">
										<Input
											placeholder="Category title"
											value={categoryFormData.title}
											onChange={(e) =>
												setCategoryFormData({
													...categoryFormData,
													title: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Textarea
											placeholder="Description"
											value={categoryFormData.description}
											onChange={(e) =>
												setCategoryFormData({
													...categoryFormData,
													description: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<DialogFooter>
									<Button onClick={handleCategorySubmit}>
										{editingCategory ? "Save Changes" : "Create Category"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					{loadingCategories ? (
						<div className="flex justify-center py-6 sm:py-8">
							<Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
						</div>
					) : categories.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
								<ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-4" />
								<h3 className="font-semibold text-base sm:text-lg">
									No Categories Yet
								</h3>
								<p className="text-xs sm:text-sm text-gray-500">
									Create a category to start organizing your images
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-3 sm:gap-4">
							{categories.map((category) => (
								<Card key={category.id}>
									<CardContent className="flex flex-col sm:flex-row items-start justify-between p-4 sm:p-6 gap-4">
										<div className="space-y-2">
											<h3 className="font-semibold text-lg">
												{category.title}
											</h3>
											<p className="text-sm text-gray-500">
												{category.description}
											</p>
											<div className="flex gap-2">
												<Badge variant="secondary">
													{imageCounts[category.id] || 0} images
												</Badge>
												<Badge variant="outline">{category.name}</Badge>
											</div>
										</div>

										<div className="flex gap-2">
											<CldUploadWidget
												uploadPreset={
													process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
													"ml_default"
												}
												options={{
													folder: `sarvodayaGallery/${category.name}`,
													multiple: true,
													maxFiles: 50,
													resourceType: "image",
													clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
													maxFileSize: 10000000,
												}}
												onSuccess={() => {
													fetchImageCount(category.id, category.name);
													toast.success("Images uploaded successfully");
												}}
												onError={() => toast.error("Upload failed")}
											>
												{({ open }) => (
													<Button variant="outline" onClick={() => open()}>
														<Upload className="mr-2 h-4 w-4" /> Upload
													</Button>
												)}
											</CldUploadWidget>

											<Button
												variant="outline"
												onClick={() => {
													setEditingCategory(category);
													setCategoryFormData({
														title: category.title,
														description: category.description,
													});
													setCategoryDialogOpen(true);
												}}
											>
												<Edit2 className="h-4 w-4" />
											</Button>

											<Button
												variant="destructive"
												onClick={() => handleDeleteCategory(category.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="videos" className="space-y-4">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<h2 className="text-xl sm:text-2xl font-bold">Video Playlists</h2>

						<Dialog
							open={playlistDialogOpen}
							onOpenChange={setPlaylistDialogOpen}
						>
							<DialogTrigger asChild>
								<Button
									onClick={resetPlaylistForm}
									className="w-full sm:w-auto"
								>
									<Plus className="mr-2 h-4 w-4" /> Add Playlist
								</Button>
							</DialogTrigger>
							<DialogContent className="mx-4 max-w-lg">
								<DialogHeader>
									<DialogTitle className="text-lg sm:text-xl">
										{editingPlaylist ? "Edit Playlist" : "Create Playlist"}
									</DialogTitle>
									<DialogDescription className="text-sm sm:text-base">
										Add the YouTube playlist details below
									</DialogDescription>
								</DialogHeader>

								<div className="grid gap-4 py-4">
									<div className="space-y-2">
										<Input
											placeholder="Playlist title"
											value={playlistFormData.title}
											onChange={(e) =>
												setPlaylistFormData({
													...playlistFormData,
													title: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Input
											placeholder="YouTube Playlist ID"
											value={playlistFormData.youtubeId}
											onChange={(e) =>
												setPlaylistFormData({
													...playlistFormData,
													youtubeId: e.target.value,
												})
											}
										/>
										<p className="text-xs text-gray-500">
											Example ID: PLLNvFiU5ntQd5nwiHP3Y8F5WKM4ywa11-
										</p>
									</div>
								</div>

								<DialogFooter>
									<Button onClick={handlePlaylistSubmit}>
										{editingPlaylist ? "Save Changes" : "Create Playlist"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					{loadingPlaylists ? (
						<div className="flex justify-center py-6 sm:py-8">
							<Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
						</div>
					) : playlists.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
								<Youtube className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-4" />
								<h3 className="font-semibold text-base sm:text-lg">
									No Playlists Yet
								</h3>
								<p className="text-xs sm:text-sm text-gray-500">
									Add a YouTube playlist to showcase videos
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-3 sm:gap-4">
							{playlists.map((playlist) => (
								<Card key={playlist.id}>
									<CardContent className="flex items-start justify-between p-6">
										<div className="space-y-2">
											<h3 className="font-semibold text-lg">
												{playlist.title}
											</h3>
											<Badge variant="outline">{playlist.youtubeId}</Badge>
										</div>

										<div className="flex gap-2">
											<Button
												variant="outline"
												onClick={() => {
													setEditingPlaylist(playlist);
													setPlaylistFormData({
														title: playlist.title,
														youtubeId: playlist.youtubeId,
													});
													setPlaylistDialogOpen(true);
												}}
											>
												<Edit2 className="h-4 w-4" />
											</Button>

											<Button
												variant="destructive"
												onClick={() => handleDeletePlaylist(playlist.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
