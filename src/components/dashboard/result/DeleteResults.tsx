/** @format */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

interface Class {
	id: number;
	name: string;
	displayName: string;
}

interface DeleteResultsProps {
	classes: Class[];
}

export default function DeleteResultsComponent({
	classes,
}: DeleteResultsProps) {
	const [loading, setLoading] = useState(false);
	const [deleteType, setDeleteType] = useState<"all" | "class">("class");
	const [selectedClassId, setSelectedClassId] = useState<string>("");
	const [academicYear, setAcademicYear] = useState<string>("");
	const [confirmText, setConfirmText] = useState<string>("");
	const [deleteStats, setDeleteStats] = useState<{
		count: number;
		studentCount: number;
		details: Record<string, string>;
	} | null>(null);

	const getDeleteStats = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				type: deleteType,
				...(deleteType === "class" &&
					selectedClassId && { classId: selectedClassId }),
				...(academicYear && { academicYear }),
			});

			const response = await fetch(`/api/result/bulk-delete?${params}`);
			const data = await response.json();

			if (!response.ok) throw new Error(data.error);

			setDeleteStats(data);
		} catch (error) {
			console.error("Error getting delete stats:", error);
			toast.error("Failed to get delete statistics");
		} finally {
			setLoading(false);
		}
	};

	const handleBulkDelete = async () => {
		if (!deleteStats || deleteStats.count === 0) {
			toast.error("No results to delete");
			return;
		}

		if (confirmText !== "DELETE") {
			toast.error('Please type "DELETE" to confirm');
			return;
		}

		if (
			!confirm(
				`Are you absolutely sure? This will permanently delete ${deleteStats.count} result(s) and ${deleteStats.studentCount} student(s). This action cannot be undone.`
			)
		) {
			return;
		}

		try {
			setLoading(true);
			const params = new URLSearchParams({
				type: deleteType,
				...(deleteType === "class" &&
					selectedClassId && { classId: selectedClassId }),
				...(academicYear && { academicYear }),
			});

			const response = await fetch(`/api/result/bulk-delete?${params}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) throw new Error(data.error);

			const resultText = data.deletedCount === 1 ? "result" : "results";
			const studentText =
				data.studentDeleteCount === 1 ? "student" : "students";
			toast.success(
				`Successfully deleted ${data.deletedCount} ${resultText} and ${data.studentDeleteCount} ${studentText}`
			);

			// Reset form
			setDeleteStats(null);
			setConfirmText("");
			setAcademicYear("");
			setSelectedClassId("");
		} catch (error) {
			console.error("Error deleting results:", error);
			toast.error("Failed to delete results");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="border rounded-lg p-6 bg-red-50 border-red-200 space-y-4">
			<div className="flex items-center gap-2 text-red-700">
				<AlertTriangle className="h-5 w-5" />
				<h3 className="font-semibold text-lg">
					Bulk Delete Students & Results
				</h3>
			</div>

			<div className="bg-red-100 border border-red-200 rounded p-3 text-sm text-red-800">
				<p className="font-medium">⚠️ Danger Zone</p>
				<p>
					This will permanently delete students, results, and all subject marks
					from the database. This action cannot be undone and will allow you to
					re-upload the same students. Please be very careful.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<Label>Delete Type</Label>
					<Select
						value={deleteType}
						onValueChange={(value: "all" | "class") => {
							setDeleteType(value);
							setDeleteStats(null);
							setConfirmText("");
						}}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="class">Class-wise deletion</SelectItem>
							<SelectItem value="all">Delete all results</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{deleteType === "class" && (
					<div>
						<Label>Select Class</Label>
						<Select
							value={selectedClassId}
							onValueChange={(value) => {
								setSelectedClassId(value);
								setDeleteStats(null);
								setConfirmText("");
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Choose class" />
							</SelectTrigger>
							<SelectContent>
								{classes.map((cls) => (
									<SelectItem key={cls.id} value={cls.id.toString()}>
										{cls.displayName}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<div>
					<Label>Academic Year (Optional)</Label>
					<Input
						value={academicYear}
						onChange={(e) => {
							setAcademicYear(e.target.value);
							setDeleteStats(null);
							setConfirmText("");
						}}
						placeholder="2024-25"
					/>
				</div>
			</div>

			<div className="flex gap-2">
				<Button
					onClick={getDeleteStats}
					disabled={loading || (deleteType === "class" && !selectedClassId)}
					variant="outline"
				>
					{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
					Check What Will Be Deleted
				</Button>
			</div>

			{deleteStats && (
				<div className="space-y-4 p-4 border rounded bg-white">
					<div className="text-sm">
						<p className="font-medium">Delete Preview:</p>
						<div className="space-y-1">
							<p className="text-red-600">
								{deleteStats.count} result(s) will be permanently deleted
							</p>
							<p className="text-red-600">
								{deleteStats.studentCount} student(s) will be permanently
								deleted
							</p>
						</div>
						{deleteStats.details.className && (
							<p className="text-gray-600">
								Class: {deleteStats.details.className}
							</p>
						)}
						{deleteStats.details.academicYear && (
							<p className="text-gray-600">
								Academic Year: {deleteStats.details.academicYear}
							</p>
						)}
					</div>

					{deleteStats.count > 0 && (
						<div className="space-y-2">
							<Label>Type &quot;DELETE&quot; to confirm</Label>
							<Input
								value={confirmText}
								onChange={(e) => setConfirmText(e.target.value)}
								placeholder="Type DELETE here"
								className="max-w-xs"
							/>
							<Button
								onClick={handleBulkDelete}
								disabled={loading || confirmText !== "DELETE"}
								variant="destructive"
								size="sm"
							>
								{loading ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : (
									<Trash2 className="h-4 w-4 mr-2" />
								)}
								Permanently Delete {deleteStats.count} Result(s) &{" "}
								{deleteStats.studentCount} Student(s)
							</Button>
						</div>
					)}

					{deleteStats.count === 0 && (
						<p className="text-green-600 text-sm">
							✓ No results found matching the criteria
						</p>
					)}
				</div>
			)}
		</div>
	);
}
