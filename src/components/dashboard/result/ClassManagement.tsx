/** @format */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DeleteResultsComponent from "./DeleteResults";
import {
	Plus,
	Trash2,
	Loader2,
	GraduationCap,
	BookOpen,
	Zap,
	Copy,
	Download,
	Upload,
	Wand2,
	Settings,
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
	theoryMaxMarks?: number;
	practicalMaxMarks?: number;
	theoryPassingMarks?: number;
	practicalPassingMarks?: number;
	hasPractical: boolean;
	isAdditional: boolean;
	order: number;
}

// Subject templates for quick setup
const subjectTemplates = {
	prePrimary: [
		{ name: "English", maxMarks: 50, passingMarks: 17, order: 1 },
		{ name: "Hindi", maxMarks: 50, passingMarks: 17, order: 2 },
		{ name: "Mathematics", maxMarks: 50, passingMarks: 17, order: 3 },
	],
	primary: [
		{ name: "English", maxMarks: 50, passingMarks: 17, order: 1 },
		{ name: "Hindi", maxMarks: 50, passingMarks: 17, order: 2 },
		{ name: "Mathematics", maxMarks: 50, passingMarks: 17, order: 3 },
		{
			name: "EVS",
			maxMarks: 50,
			passingMarks: 17,
			order: 4,
		},
	],
	middleSchool: [
		{ name: "English", maxMarks: 100, passingMarks: 33, order: 1 },
		{ name: "Hindi", maxMarks: 100, passingMarks: 33, order: 2 },
		{ name: "Mathematics", maxMarks: 100, passingMarks: 33, order: 3 },
		{ name: "Science", maxMarks: 100, passingMarks: 33, order: 4 },
		{ name: "SST", maxMarks: 100, passingMarks: 33, order: 5 },
		{ name: "Sanskrit", maxMarks: 100, passingMarks: 33, order: 6 },
	],
	secondary: [
		{
			name: "English",
			theoryMaxMarks: 80,
			practicalMaxMarks: 20,
			order: 1,
			hasPractical: true,
		},
		{
			name: "Hindi",
			theoryMaxMarks: 80,
			practicalMaxMarks: 20,
			order: 2,
			hasPractical: true,
		},
		{
			name: "Mathematics",
			theoryMaxMarks: 80,
			practicalMaxMarks: 20,
			order: 3,
			hasPractical: true,
		},
		{
			name: "Science",
			theoryMaxMarks: 75,
			practicalMaxMarks: 25,
			order: 4,
			hasPractical: true,
		},
		{
			name: "SST",
			theoryMaxMarks: 80,
			practicalMaxMarks: 20,
			order: 5,
			hasPractical: true,
		},
		{
			name: "Sanskrit",
			theoryMaxMarks: 80,
			practicalMaxMarks: 20,
			order: 6,
			hasPractical: true,
		},
	],
	seniorSecondary: {
		scienceMaths: [
			{
				name: "English",
				theoryMaxMarks: 80,
				practicalMaxMarks: 20,
				order: 1,
				hasPractical: true,
			},
			{
				name: "Hindi",
				theoryMaxMarks: 80,
				practicalMaxMarks: 20,
				order: 2,
				hasPractical: true,
			},
			{
				name: "Physics",
				theoryMaxMarks: 70,
				practicalMaxMarks: 30,
				order: 3,
				hasPractical: true,
			},
			{
				name: "Chemistry",
				theoryMaxMarks: 70,
				practicalMaxMarks: 30,
				order: 4,
				hasPractical: true,
			},
			{
				name: "Mathematics",
				theoryMaxMarks: 80,
				practicalMaxMarks: 20,
				order: 5,
				hasPractical: true,
			},
			{
				name: "Biology",
				theoryMaxMarks: 70,
				practicalMaxMarks: 30,
				order: 6,
				hasPractical: true,
				isAdditional: true,
			},
		],
		scienceBio: [
			{
				name: "English",
				theoryMaxMarks: 80,
				practicalMaxMarks: 20,
				order: 1,
				hasPractical: true,
			},
			{
				name: "Hindi",
				theoryMaxMarks: 80,
				practicalMaxMarks: 20,
				order: 2,
				hasPractical: true,
			},
			{
				name: "Physics",
				theoryMaxMarks: 70,
				practicalMaxMarks: 30,
				order: 3,
				hasPractical: true,
			},
			{
				name: "Chemistry",
				theoryMaxMarks: 70,
				practicalMaxMarks: 30,
				order: 4,
				hasPractical: true,
			},
			{
				name: "Bioilogy",
				theoryMaxMarks: 70,
				practicalMaxMarks: 30,
				order: 5,
				hasPractical: true,
			},
			{
				name: "Mathematics",
				theoryMaxMarks: 80,
				practicalMaxMarks: 20,
				order: 6,
				hasPractical: true,
				isAdditional: true,
			},
		],
	},
};

export default function ClassManagement() {
	const [classes, setClasses] = useState<Class[]>([]);
	const [loading, setLoading] = useState(true);
	const [showClassForm, setShowClassForm] = useState(false);
	const [showSubjectForm, setShowSubjectForm] = useState(false);
	const [showQuickSetup, setShowQuickSetup] = useState(false);
	const [showBulkSubjects, setShowBulkSubjects] = useState(false);
	const [editingClass, setEditingClass] = useState<Class | null>(null);
	const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
	const [showDeleteResults, setShowDeleteResults] = useState(false);
	const [selectedClass, setSelectedClass] = useState<number | null>(null);
	const [bulkClassText, setBulkClassText] = useState("");
	const [bulkSubjectText, setBulkSubjectText] = useState("");
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");
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
		theoryMaxMarks: 80,
		practicalMaxMarks: 20,
		isAdditional: false,
		order: 0,
	});

	// Helper function to check if a class should have theory/practical structure
	const isHigherClass = (className: string) => {
		if (!className) return false;

		const lowerName = className.toLowerCase();

		return (
			// Standard class names
			["9th", "10th", "11th", "12th", "9", "10", "11", "12"].includes(
				className
			) ||
			// Special stream classes - case insensitive matching
			lowerName.includes("11th") ||
			lowerName.includes("12th") ||
			lowerName.includes("9th") ||
			lowerName.includes("10th") ||
			// Stream indicators
			lowerName.includes("maths") ||
			lowerName.includes("math") ||
			lowerName.includes("bio") ||
			lowerName.includes("biology") ||
			lowerName.includes("science") ||
			lowerName.includes("commerce") ||
			lowerName.includes("arts") ||
			lowerName.includes("humanities")
		);
	};

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
				theoryMaxMarks: 80,
				practicalMaxMarks: 20,
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

	const handleEditClass = (classData: Class) => {
		setEditingClass(classData);
		setClassForm({
			name: classData.name,
			displayName: classData.displayName,
			order: classData.order,
		});
		setShowClassForm(true);
	};

	const handleUpdateClass = async () => {
		if (!editingClass || !classForm.name || !classForm.displayName) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			const response = await fetch(`/api/result/classes/${editingClass.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(classForm),
			});

			if (!response.ok) throw new Error("Failed to update class");

			toast.success("Class updated successfully");
			setShowClassForm(false);
			setEditingClass(null);
			setClassForm({ name: "", displayName: "", order: 0 });
			await loadClasses();
		} catch (error) {
			console.error("Error updating class:", error);
			toast.error("Failed to update class");
		}
	};

	const handleEditSubject = (subject: Subject, classId: number) => {
		setEditingSubject(subject);
		setSelectedClass(classId);
		setSubjectForm({
			name: subject.name,
			code: subject.code || "",
			maxMarks: subject.maxMarks,
			passingMarks: subject.passingMarks,
			theoryMaxMarks: subject.theoryMaxMarks || 80,
			practicalMaxMarks: subject.practicalMaxMarks || 20,
			isAdditional: subject.isAdditional,
			order: subject.order,
		});
		setShowSubjectForm(true);
	};

	const handleUpdateSubject = async () => {
		if (!editingSubject || !subjectForm.name || !selectedClass) {
			toast.error("Please fill all required fields");
			return;
		}

		try {
			const response = await fetch(
				`/api/result/classes/${selectedClass}/subjects`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: editingSubject.id,
						...subjectForm,
					}),
				}
			);

			if (!response.ok) throw new Error("Failed to update subject");

			toast.success("Subject updated successfully");
			setShowSubjectForm(false);
			setEditingSubject(null);
			setSubjectForm({
				name: "",
				code: "",
				maxMarks: 100,
				passingMarks: 33,
				theoryMaxMarks: 80,
				practicalMaxMarks: 20,
				isAdditional: false,
				order: 0,
			});
			await loadClasses();
		} catch (error) {
			console.error("Error updating subject:", error);
			toast.error("Failed to update subject");
		}
	};

	const cancelEdit = () => {
		setShowClassForm(false);
		setShowSubjectForm(false);
		setShowQuickSetup(false);
		setShowBulkSubjects(false);
		setEditingClass(null);
		setEditingSubject(null);
		setClassForm({ name: "", displayName: "", order: 0 });
		setSubjectForm({
			name: "",
			code: "",
			maxMarks: 100,
			passingMarks: 33,
			theoryMaxMarks: 80,
			practicalMaxMarks: 20,
			isAdditional: false,
			order: 0,
		});
		setBulkClassText("");
		setBulkSubjectText("");
		setSelectedTemplate("");
	};

	// Bulk create classes from text input
	const handleBulkCreateClasses = async () => {
		if (!bulkClassText.trim()) {
			toast.error("Please enter class data");
			return;
		}

		try {
			const lines = bulkClassText
				.trim()
				.split("\n")
				.filter((line) => line.trim());
			const classesToCreate = [];

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i].trim();
				let name = "",
					displayName = "";

				if (line.includes(",")) {
					[name, displayName] = line.split(",").map((s) => s.trim());
				} else {
					name = line;
					displayName = `Class ${line}`;
				}

				classesToCreate.push({
					name,
					displayName,
					order: i + 1,
				});
			}

			const response = await fetch("/api/result/classes/bulk", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ classes: classesToCreate }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create classes");
			}

			toast.success(
				data.message || `Created ${data.classes?.length || 0} classes`
			);
			setBulkClassText("");
			setShowQuickSetup(false);
			await loadClasses();
		} catch (error) {
			console.error("Error in bulk create:", error);
			toast.error("Failed to create classes");
		}
	};

	// Apply subject template to a class
	const handleApplyTemplate = async (
		classId: number,
		templateType: string,
		streamType?: string
	) => {
		let template: Array<{
			name: string;
			maxMarks?: number;
			passingMarks?: number;
			theoryMaxMarks?: number;
			practicalMaxMarks?: number;
			order: number;
			hasPractical?: boolean;
			isAdditional?: boolean;
		}> = [];

		switch (templateType) {
			case "prePrimary":
				template = subjectTemplates.prePrimary;
				break;
			case "primary":
				template = subjectTemplates.primary;
				break;
			case "middleSchool":
				template = subjectTemplates.middleSchool;
				break;
			case "secondary":
				template = subjectTemplates.secondary;
				break;
			case "seniorSecondary":
				if (streamType === "scienceMaths") {
					template = subjectTemplates.seniorSecondary.scienceMaths;
				} else if (streamType === "scienceBio") {
					template = subjectTemplates.seniorSecondary.scienceBio;
				}
				break;
		}

		if (template.length === 0) {
			toast.error("Invalid template selected");
			return;
		}

		try {
			let successCount = 0;
			for (const subjectData of template) {
				const subjectPayload = {
					...subjectData,
					maxMarks: subjectData.hasPractical
						? (subjectData.theoryMaxMarks || 80) +
						  (subjectData.practicalMaxMarks || 20)
						: subjectData.maxMarks || 100,
					passingMarks: subjectData.hasPractical
						? Math.ceil(
								((subjectData.theoryMaxMarks || 80) +
									(subjectData.practicalMaxMarks || 20)) *
									0.33
						  )
						: subjectData.passingMarks || 33,
					theoryPassingMarks: subjectData.hasPractical
						? Math.ceil((subjectData.theoryMaxMarks || 80) * 0.33)
						: undefined,
					practicalPassingMarks: subjectData.hasPractical
						? Math.ceil((subjectData.practicalMaxMarks || 20) * 0.33)
						: undefined,
				};

				try {
					const response = await fetch(
						`/api/result/classes/${classId}/subjects`,
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(subjectPayload),
						}
					);

					if (response.ok) {
						successCount++;
					}
				} catch (error) {
					console.error(`Error creating subject ${subjectData.name}:`, error);
				}
			}

			toast.success(`Added ${successCount} subjects from template`);
			await loadClasses();
		} catch (error) {
			console.error("Error applying template:", error);
			toast.error("Failed to apply template");
		}
	};

	// Bulk create subjects from text input
	const handleBulkCreateSubjects = async () => {
		if (!bulkSubjectText.trim() || !selectedClass) {
			toast.error("Please enter subject data and select a class");
			return;
		}

		try {
			const lines = bulkSubjectText
				.trim()
				.split("\n")
				.filter((line) => line.trim());
			const subjectsToCreate = [];

			const classObj = classes.find((c) => c.id === selectedClass);
			const className = classObj?.name || "";

			// Use helper function for consistent checking
			const isHigherClassSelected = isHigherClass(className);

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i].trim();
				let name = "",
					code = "",
					maxMarks = 100,
					isAdditional = false;

				const parts = line.split(",").map((s) => s.trim());
				name = parts[0];
				if (parts[1]) code = parts[1];
				if (parts[2]) maxMarks = parseInt(parts[2]) || 100;
				if (parts[3]) isAdditional = parts[3].toLowerCase() === "true";

				const subjectData = {
					name,
					code,
					order: i + 1,
					isAdditional,
					...(isHigherClassSelected
						? {
								theoryMaxMarks: Math.floor(maxMarks * 0.8),
								practicalMaxMarks: Math.floor(maxMarks * 0.2),
								maxMarks: maxMarks,
								passingMarks: Math.ceil(maxMarks * 0.33),
								theoryPassingMarks: Math.ceil(
									Math.floor(maxMarks * 0.8) * 0.33
								),
								practicalPassingMarks: Math.ceil(
									Math.floor(maxMarks * 0.2) * 0.33
								),
								hasPractical: true,
						  }
						: {
								maxMarks,
								passingMarks: Math.ceil(maxMarks * 0.33),
								hasPractical: false,
						  }),
				};

				subjectsToCreate.push(subjectData);
			}

			const response = await fetch(
				`/api/result/classes/${selectedClass}/subjects/bulk`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ subjects: subjectsToCreate }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create subjects");
			}

			toast.success(
				data.message || `Created ${data.subjects?.length || 0} subjects`
			);
			setBulkSubjectText("");
			setShowBulkSubjects(false);
			await loadClasses();
		} catch (error) {
			console.error("Error in bulk create subjects:", error);
			toast.error("Failed to create subjects");
		}
	};

	// Copy subjects from one class to another
	const handleCopySubjects = async (fromClassId: number, toClassId: number) => {
		if (fromClassId === toClassId) {
			toast.error("Cannot copy subjects to the same class");
			return;
		}

		const fromClass = classes.find((c) => c.id === fromClassId);
		if (!fromClass || fromClass.subjects.length === 0) {
			toast.error("Source class has no subjects to copy");
			return;
		}

		try {
			let successCount = 0;
			for (const subject of fromClass.subjects) {
				const subjectData = {
					name: subject.name,
					code: subject.code,
					maxMarks: subject.maxMarks,
					passingMarks: subject.passingMarks,
					theoryMaxMarks: subject.theoryMaxMarks,
					practicalMaxMarks: subject.practicalMaxMarks,
					theoryPassingMarks: subject.theoryPassingMarks,
					practicalPassingMarks: subject.practicalPassingMarks,
					hasPractical: subject.hasPractical,
					isAdditional: subject.isAdditional,
					order: subject.order,
				};

				try {
					const response = await fetch(
						`/api/result/classes/${toClassId}/subjects`,
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(subjectData),
						}
					);

					if (response.ok) {
						successCount++;
					}
				} catch (error) {
					console.error(`Error copying subject ${subject.name}:`, error);
				}
			}

			toast.success(`Copied ${successCount} subjects successfully`);
			await loadClasses();
		} catch (error) {
			console.error("Error copying subjects:", error);
			toast.error("Failed to copy subjects");
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
			{/* Quick Setup Header */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
							<GraduationCap className="h-6 w-6 text-blue-600" />
							Class & Subject Management
						</h2>
						<p className="text-gray-600 mt-1">
							Quick setup tools for faster configuration
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() => setShowQuickSetup(!showQuickSetup)}
							className="bg-blue-600 hover:bg-blue-700"
							size="sm"
						>
							<Zap className="h-4 w-4 mr-2" />
							Quick Setup
						</Button>
						<Button
							onClick={() => setShowClassForm(true)}
							variant="outline"
							size="sm"
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Class
						</Button>
					</div>
				</div>
			</div>

			{/* Quick Setup Panel */}
			{showQuickSetup && (
				<div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50/50">
					<h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
						<Wand2 className="h-5 w-5 text-blue-600" />
						Quick Setup Options
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Bulk Create Classes */}
						<div className="space-y-3">
							<h4 className="font-medium flex items-center gap-2">
								<Plus className="h-4 w-4" />
								Bulk Create Classes
							</h4>
							<p className="text-sm text-gray-600 mb-3">
								Enter class names, one per line. Format: &quot;Class Name&quot;
								or &quot;Class Name, Display Name&quot;
							</p>
							<textarea
								className="w-full p-3 border rounded-md resize-none h-32 text-sm"
								placeholder={`Examples:\nNursery\nLKG, Lower Kindergarten\nUKG, Upper Kindergarten\n1st, Class 1st\n2nd, Class 2nd\n3rd, Class 3rd`}
								value={bulkClassText}
								onChange={(e) => setBulkClassText(e.target.value)}
							/>
							<Button
								onClick={handleBulkCreateClasses}
								disabled={!bulkClassText.trim()}
								size="sm"
								className="w-full"
							>
								Create Classes
							</Button>
						</div>

						{/* Subject Templates */}
						<div className="space-y-3">
							<h4 className="font-medium flex items-center gap-2">
								<BookOpen className="h-4 w-4" />
								Subject Templates
							</h4>
							<p className="text-sm text-gray-600 mb-3">
								Apply pre-defined subject structures to classes quickly
							</p>
							<div className="space-y-2">
								{classes.map((cls) => (
									<div
										key={cls.id}
										className="flex items-center justify-between p-2 border rounded bg-white"
									>
										<span className="font-medium text-sm">
											{cls.displayName}
										</span>
										<div className="flex gap-1">
											<select
												className="text-xs border rounded px-2 py-1"
												onChange={(e) => {
													if (e.target.value) {
														const [templateType, streamType] =
															e.target.value.split(":");
														handleApplyTemplate(
															cls.id,
															templateType,
															streamType
														);
														e.target.value = "";
													}
												}}
											>
												<option value="">Select Template</option>
												<option value="prePrimary">
													Pre-Primary (Nursery to KGII)
												</option>
												<option value="primary">Primary (1st-5th)</option>
												<option value="middleSchool">
													Middle School (6th-8th)
												</option>
												<option value="secondary">Secondary (9th-10th)</option>
												<option value="seniorSecondary:scienceMaths">
													Sr. Secondary - Science & Maths
												</option>
												<option value="seniorSecondary:scienceBio">
													Sr. Secondary - Science & Bio
												</option>
											</select>
											{classes.filter(
												(c) => c.id !== cls.id && c.subjects.length > 0
											).length > 0 && (
												<select
													className="text-xs border rounded px-2 py-1 ml-1"
													onChange={(e) => {
														if (e.target.value) {
															handleCopySubjects(
																parseInt(e.target.value),
																cls.id
															);
															e.target.value = "";
														}
													}}
												>
													<option value="">Copy From</option>
													{classes
														.filter(
															(c) => c.id !== cls.id && c.subjects.length > 0
														)
														.map((c) => (
															<option key={c.id} value={c.id}>
																{c.displayName}
															</option>
														))}
												</select>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Class Form */}
			{showClassForm && (
				<div className="border rounded-lg p-4 bg-gray-50 space-y-4">
					<h3 className="font-semibold text-lg flex items-center gap-2">
						<GraduationCap className="h-5 w-5" />
						{editingClass ? "Edit Class" : "Add New Class"}
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
						<Button
							onClick={editingClass ? handleUpdateClass : handleCreateClass}
						>
							{editingClass ? "Update Class" : "Create Class"}
						</Button>
						<Button variant="outline" onClick={cancelEdit}>
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
						{editingSubject ? "Edit Subject" : "Add Subject to"}{" "}
						{classes.find((c) => c.id === selectedClass)?.displayName}
					</h3>
					{/* Show info about theory/practical for classes 9-12 */}
					{(() => {
						const currentClass = classes.find((c) => c.id === selectedClass);
						const className = currentClass?.name || "";

						return isHigherClass(className);
					})() && (
						<div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
							<p className="font-medium text-yellow-800">
								📚 Theory + Practical Structure
							</p>
							<p className="text-yellow-700">
								For classes 9-12, each subject has theory and practical
								components. Students must pass both theory (33%) and practical
								(33%) separately, plus achieve 33% in the total marks.
							</p>
						</div>
					)}
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
						{/* Show theory/practical fields for classes 9-12 */}
						{(() => {
							const currentClass = classes.find((c) => c.id === selectedClass);
							const className = currentClass?.name || "";

							return isHigherClass(className);
						})() ? (
							<>
								<div>
									<Label>Theory Max Marks</Label>
									<Input
										type="number"
										value={subjectForm.theoryMaxMarks}
										onChange={(e) => {
											const theoryMarks = parseInt(e.target.value) || 80;
											setSubjectForm({
												...subjectForm,
												theoryMaxMarks: theoryMarks,
												maxMarks: theoryMarks + subjectForm.practicalMaxMarks,
												passingMarks: Math.ceil(
													(theoryMarks + subjectForm.practicalMaxMarks) * 0.33
												),
											});
										}}
									/>
								</div>
								<div>
									<Label>Practical Max Marks</Label>
									<Input
										type="number"
										value={subjectForm.practicalMaxMarks}
										onChange={(e) => {
											const practicalMarks = parseInt(e.target.value) || 20;
											setSubjectForm({
												...subjectForm,
												practicalMaxMarks: practicalMarks,
												maxMarks: subjectForm.theoryMaxMarks + practicalMarks,
												passingMarks: Math.ceil(
													(subjectForm.theoryMaxMarks + practicalMarks) * 0.33
												),
											});
										}}
									/>
								</div>
								<div>
									<Label>Total Max Marks</Label>
									<Input
										type="number"
										value={subjectForm.maxMarks}
										disabled
										className="bg-gray-100"
									/>
									<p className="text-xs text-gray-500 mt-1">
										Auto-calculated: Theory + Practical
									</p>
								</div>
							</>
						) : (
							<>
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
							</>
						)}
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
						<Button
							onClick={
								editingSubject ? handleUpdateSubject : handleCreateSubject
							}
						>
							{editingSubject ? "Update Subject" : "Add Subject"}
						</Button>
						<Button variant="outline" onClick={cancelEdit}>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Bulk Subject Form */}
			{showBulkSubjects && selectedClass && (
				<div className="border rounded-lg p-4 bg-green-50 space-y-4">
					<h3 className="font-semibold text-lg flex items-center gap-2">
						<Upload className="h-5 w-5" />
						Bulk Add Subjects to{" "}
						{classes.find((c) => c.id === selectedClass)?.displayName}
					</h3>
					<p className="text-sm text-gray-600">
						Enter subjects one per line. Format:
						SubjectName,Code,MaxMarks,IsAdditional
						<br />
						Example: Mathematics,MATH,100,false
					</p>
					<textarea
						className="w-full p-3 border rounded-md resize-none h-32 text-sm font-mono"
						placeholder={`Mathematics,MATH,100,false
English,ENG,100,false
Science,SCI,100,false
Social Science,SS,100,false
Hindi,HIN,100,false
Computer Science,CS,50,true`}
						value={bulkSubjectText}
						onChange={(e) => setBulkSubjectText(e.target.value)}
					/>
					<div className="flex gap-2">
						<Button onClick={handleBulkCreateSubjects}>Add Subjects</Button>
						<Button
							variant="outline"
							onClick={() => setShowBulkSubjects(false)}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Classes List */}
			<div className="flex justify-between items-center">
				<h3 className="font-semibold text-lg">Classes</h3>
				<div className="flex gap-2">
					<Button
						onClick={() => setShowClassForm(true)}
						size="sm"
						variant="outline"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Class
					</Button>
				</div>
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
							<div className="flex flex-wrap gap-2">
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
									onClick={() => {
										setSelectedClass(cls.id);
										setShowBulkSubjects(true);
									}}
									className="text-green-600 border-green-300 hover:bg-green-50"
								>
									<Upload className="h-4 w-4 mr-1" />
									Bulk Add
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleEditClass(cls)}
								>
									<Settings className="h-4 w-4 mr-1" />
									Edit
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleDeleteClass(cls.id)}
									className="text-red-600 border-red-300 hover:bg-red-50"
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
												{subject.hasPractical ? (
													<div className="text-xs text-gray-500">
														<p>
															Theory: {subject.theoryMaxMarks} (Pass:{" "}
															{subject.theoryPassingMarks})
														</p>
														<p>
															Practical: {subject.practicalMaxMarks} (Pass:{" "}
															{subject.practicalPassingMarks})
														</p>
														<p>
															Total: {subject.maxMarks} (Pass:{" "}
															{subject.passingMarks})
														</p>
														{subject.isAdditional && (
															<span className="text-orange-600">
																(Additional)
															</span>
														)}
													</div>
												) : (
													<p className="text-xs text-gray-500">
														Max: {subject.maxMarks}, Pass:{" "}
														{subject.passingMarks}
														{subject.isAdditional && " (Additional)"}
													</p>
												)}
											</div>
											<div className="flex gap-1">
												<Button
													size="sm"
													variant="ghost"
													onClick={() => handleEditSubject(subject, cls.id)}
													title="Edit Subject"
												>
													✏️
												</Button>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => {
														setSelectedClass(cls.id);
														handleDeleteSubject(subject.id);
													}}
													title="Delete Subject"
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											</div>
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

			{/* Result Deletion Section */}
			{classes.length > 0 && (
				<>
					<hr className="my-8" />
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="font-semibold text-lg text-red-600">
								Result Management
							</h3>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowDeleteResults(!showDeleteResults)}
							>
								{showDeleteResults ? "Hide" : "Show"} Delete Options
							</Button>
						</div>

						{showDeleteResults && <DeleteResultsComponent classes={classes} />}
					</div>
				</>
			)}
		</div>
	);
}
