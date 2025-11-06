/** @format */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Plus,
	Trash2,
	Loader2,
	GraduationCap,
	BookOpen,
} from "lucide-react";

interface Class {
	id: number;
	name: string;
	displayName: string;
	order: number;
	isActive: boolean;
	subjects: Subject[];
}

interface Subject {
	id: number;
	name: string;
	code?: string;
	maxMarks: number;
	passingMarks: number;
	isAdditional: boolean;
	order: number;
}

export default function ClassManagement() {
	const [classes, setClasses] = useState<Class[]>([]);
	const [loading, setLoading] = useState(true);
	const [showClassForm, setShowClassForm] = useState(false);
	const [showSubjectForm, setShowSubjectForm] = useState(false);
	const [selectedClass, setSelectedClass] = useState<number | null>(null);
	const [classForm, setClassForm] = useState({
		name: "",
		displayName: "",
		order: 0,
	});
	const [subjectForm, setSubjectForm] = useState({
		name: "",
		code: "",
		maxMarks: 100,
		passingMarks: 33,
		isAdditional: false,
		order: 0,
	});

	const loadClasses = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/result/classes");
			const data = await response.json();
			setClasses(data.classes || []);
		} catch (error) {
			console.error("Error loading classes:", error);
			toast.error("Failed to load classes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadClasses();
	}, []);

	const handleCreateClass = async () => {
		if (!classForm.name || !classForm.displayName) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			const response = await fetch("/api/result/classes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(classForm),
			});

			if (!response.ok) throw new Error("Failed to create class");

			toast.success("Class created successfully");
			setShowClassForm(false);
			setClassForm({ name: "", displayName: "", order: 0 });
			await loadClasses();
		} catch (error) {
			console.error("Error creating class:", error);
			toast.error("Failed to create class");
		}
	};

	const handleCreateSubject = async () => {
		if (!subjectForm.name || !selectedClass) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			const response = await fetch(
				`/api/result/classes/${selectedClass}/subjects`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(subjectForm),
				}
			);

			if (!response.ok) throw new Error("Failed to create subject");

			toast.success("Subject created successfully");
			setShowSubjectForm(false);
			setSubjectForm({
				name: "",
				code: "",
				maxMarks: 100,
				passingMarks: 33,
				isAdditional: false,
				order: 0,
			});
			await loadClasses();
		} catch (error) {
			console.error("Error creating subject:", error);
			toast.error("Failed to create subject");
		}
	};

	const handleDeleteClass = async (id: number) => {
		if (!confirm("Are you sure you want to delete this class?")) return;

		try {
			const response = await fetch(`/api/result/classes/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete class");

			toast.success("Class deleted successfully");
			await loadClasses();
		} catch (error) {
			console.error("Error deleting class:", error);
			toast.error("Failed to delete class");
		}
	};

	const handleDeleteSubject = async (subjectId: number) => {
		if (!confirm("Are you sure you want to delete this subject?")) return;

		try {
			const response = await fetch(
				`/api/result/classes/${selectedClass}/subjects?id=${subjectId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) throw new Error("Failed to delete subject");

			toast.success("Subject deleted successfully");
			await loadClasses();
		} catch (error) {
			console.error("Error deleting subject:", error);
			toast.error("Failed to delete subject");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Class Form */}
			{showClassForm && (
				<div className="border rounded-lg p-4 bg-gray-50 space-y-4">
					<h3 className="font-semibold text-lg flex items-center gap-2">
						<GraduationCap className="h-5 w-5" />
						Add New Class
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label>Class Name (e.g., &quot;10th&quot;)</Label>
							<Input
								value={classForm.name}
								onChange={(e) =>
									setClassForm({ ...classForm, name: e.target.value })
								}
								placeholder="10th"
							/>
						</div>
						<div>
							<Label>Display Name</Label>
							<Input
								value={classForm.displayName}
								onChange={(e) =>
									setClassForm({ ...classForm, displayName: e.target.value })
								}
								placeholder="Class 10th"
							/>
						</div>
						<div>
							<Label>Order</Label>
							<Input
								type="number"
								value={classForm.order}
								onChange={(e) =>
									setClassForm({
										...classForm,
										order: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Button onClick={handleCreateClass}>Create Class</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowClassForm(false);
								setClassForm({ name: "", displayName: "", order: 0 });
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Subject Form */}
			{showSubjectForm && selectedClass && (
				<div className="border rounded-lg p-4 bg-blue-50 space-y-4">
					<h3 className="font-semibold text-lg flex items-center gap-2">
						<BookOpen className="h-5 w-5" />
						Add Subject to{" "}
						{classes.find((c) => c.id === selectedClass)?.displayName}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div>
							<Label>Subject Name</Label>
							<Input
								value={subjectForm.name}
								onChange={(e) =>
									setSubjectForm({ ...subjectForm, name: e.target.value })
								}
								placeholder="Mathematics"
							/>
						</div>
						<div>
							<Label>Subject Code (Optional)</Label>
							<Input
								value={subjectForm.code}
								onChange={(e) =>
									setSubjectForm({ ...subjectForm, code: e.target.value })
								}
								placeholder="MATH101"
							/>
						</div>
						<div>
							<Label>Max Marks</Label>
							<Input
								type="number"
								value={subjectForm.maxMarks}
								onChange={(e) =>
									setSubjectForm({
										...subjectForm,
										maxMarks: parseInt(e.target.value) || 100,
									})
								}
							/>
						</div>
						<div>
							<Label>Passing Marks</Label>
							<Input
								type="number"
								value={subjectForm.passingMarks}
								onChange={(e) =>
									setSubjectForm({
										...subjectForm,
										passingMarks: parseInt(e.target.value) || 33,
									})
								}
							/>
						</div>
						<div>
							<Label>Order</Label>
							<Input
								type="number"
								value={subjectForm.order}
								onChange={(e) =>
									setSubjectForm({
										...subjectForm,
										order: parseInt(e.target.value) || 0,
									})
								}
							/>
						</div>
						<div className="flex items-center gap-2 pt-6">
							<input
								type="checkbox"
								id="isAdditional"
								checked={subjectForm.isAdditional}
								onChange={(e) =>
									setSubjectForm({
										...subjectForm,
										isAdditional: e.target.checked,
									})
								}
								className="h-4 w-4"
							/>
							<Label htmlFor="isAdditional" className="cursor-pointer">
								Additional Subject (Not in total)
							</Label>
						</div>
					</div>
					<div className="flex gap-2">
						<Button onClick={handleCreateSubject}>Add Subject</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowSubjectForm(false);
								setSubjectForm({
									name: "",
									code: "",
									maxMarks: 100,
									passingMarks: 33,
									isAdditional: false,
									order: 0,
								});
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Classes List */}
			<div className="flex justify-between items-center">
				<h3 className="font-semibold text-lg">Classes</h3>
				<Button onClick={() => setShowClassForm(true)} size="sm">
					<Plus className="h-4 w-4 mr-2" />
					Add Class
				</Button>
			</div>

			<div className="space-y-4">
				{classes.map((cls) => (
					<div key={cls.id} className="border rounded-lg p-4 space-y-3">
						<div className="flex justify-between items-center">
							<div>
								<h4 className="font-semibold text-lg">{cls.displayName}</h4>
								<p className="text-sm text-gray-500">
									{cls.subjects.length} subject(s)
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setSelectedClass(cls.id);
										setShowSubjectForm(true);
									}}
								>
									<Plus className="h-4 w-4 mr-1" />
									Add Subject
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleDeleteClass(cls.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{cls.subjects.length > 0 && (
							<div className="pl-4 space-y-2">
								<p className="text-sm font-medium text-gray-700">Subjects:</p>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
									{cls.subjects.map((subject) => (
										<div
											key={subject.id}
											className="flex items-center justify-between bg-gray-50 p-2 rounded border"
										>
											<div className="flex-1">
												<p className="font-medium text-sm">{subject.name}</p>
												<p className="text-xs text-gray-500">
													Max: {subject.maxMarks}, Pass: {subject.passingMarks}
													{subject.isAdditional && " (Additional)"}
												</p>
											</div>
											<Button
												size="sm"
												variant="ghost"
												onClick={() => {
													setSelectedClass(cls.id);
													handleDeleteSubject(subject.id);
												}}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			{classes.length === 0 && (
				<div className="text-center py-12 text-gray-500">
					<GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
					<p>No classes found. Create your first class to get started.</p>
				</div>
			)}
		</div>
	);
}
