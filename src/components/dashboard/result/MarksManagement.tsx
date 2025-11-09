/** @format */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
	Loader2,
	BookOpen,
	Users,
	AlertCircle,
	Save,
	Calculator,
} from "lucide-react";
import { toast } from "sonner";

interface Class {
	id: number;
	name: string;
	hasPractical: boolean;
}

interface Subject {
	id: number;
	name: string;
	maxMarks: number;
	theoryMaxMarks?: number;
	practicalMaxMarks?: number;
	hasPractical?: boolean;
	isAdditional?: boolean;
}

interface Student {
	id: number;
	rollNumber: string;
	name: string;
	fatherName: string;
	classId: number;
	class: Class;
}

interface MarksFormData {
	[subjectId: string]: {
		marks: string;
		theoryMarks: string;
		practicalMarks: string;
	};
}

// Get current academic year in the format used by the system
const getCurrentAcademicYear = () => {
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth(); // 0-based (0 = January)

	// Academic year starts from April (month 3)
	if (currentMonth >= 3) {
		// April or later
		return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
	} else {
		// January to March
		return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
	}
};

const currentAcademicYear = getCurrentAcademicYear();

export default function MarksManagement() {
	const [classes, setClasses] = useState<Class[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [students, setStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedClass, setSelectedClass] = useState("");
	const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [isMarksDialogOpen, setIsMarksDialogOpen] = useState(false);
	const [marksData, setMarksData] = useState<MarksFormData>({});
	const [saving, setSaving] = useState(false);
	const [dialogSubjects, setDialogSubjects] = useState<Subject[]>([]); // Filtered subjects for current student

	// Available academic years (current and past 5 years)
	const academicYears = Array.from({ length: 6 }, (_, i) => {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth();

		let startYear;
		if (currentMonth >= 3) {
			// April or later
			startYear = currentYear - i;
		} else {
			// January to March
			startYear = currentYear - 1 - i;
		}

		return `${startYear}-${(startYear + 1).toString().slice(-2)}`;
	});

	// Check if a class uses theory/practical system (classes 9-12)
	const isTheoryPracticalClass = (className: string) => {
		const classNumber = parseInt(className.replace(/\D/g, ""));
		return classNumber >= 9 && classNumber <= 12;
	};

	useEffect(() => {
		fetchClasses();
	}, []);

	const fetchClasses = async () => {
		try {
			const response = await fetch("/api/result/classes");
			if (response.ok) {
				const data = await response.json();
				setClasses(data.classes);
			}
		} catch (error) {
			console.error("Error fetching classes:", error);
		}
	};

	const fetchSubjects = useCallback(async () => {
		if (!selectedClass) return;

		try {
			const response = await fetch(
				`/api/result/classes/${selectedClass}/subjects`
			);
			if (response.ok) {
				const data = await response.json();
				setSubjects(data.subjects);
			}
		} catch (error) {
			console.error("Error fetching subjects:", error);
		}
	}, [selectedClass]);

	const fetchStudents = useCallback(async () => {
		if (!selectedClass) return;

		try {
			setLoading(true);
			const params = new URLSearchParams({
				academicYear: selectedYear,
				classId: selectedClass,
			});

			const response = await fetch(`/api/result/students?${params}`);
			if (response.ok) {
				const data = await response.json();
				setStudents(data.students);
			}
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Failed to fetch students");
		} finally {
			setLoading(false);
		}
	}, [selectedClass, selectedYear]);

	useEffect(() => {
		if (selectedClass) {
			fetchSubjects();
			fetchStudents();
		}
	}, [selectedClass, selectedYear, fetchSubjects, fetchStudents]);

	const filteredStudents = students.filter((student) => {
		const matchesSearch =
			student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.fatherName.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesSearch;
	});

	const openMarksDialog = async (student: Student) => {
		setSelectedStudent(student);

		try {
			// Fetch existing result for this student
			const params = new URLSearchParams({
				studentId: student.id.toString(),
				academicYear: selectedYear,
			});

			const response = await fetch(`/api/result/marks?${params}`);
			let existingResult = null;

			if (response.ok) {
				const data = await response.json();
				existingResult = data.result;
			}

			// Fetch student's opted-in subjects
			const optInParams = new URLSearchParams({
				studentId: student.id.toString(),
			});
			const optInResponse = await fetch(
				`/api/result/subject-opt-ins?${optInParams}`
			);
			let optedInSubjectIds: number[] = [];

			if (optInResponse.ok) {
				const optInData = await optInResponse.json();
				optedInSubjectIds = optInData.optIns.map(
					(opt: { subjectId: number }) => opt.subjectId
				);
			}

			// Filter subjects: include all non-additional subjects + opted-in additional subjects
			const filteredSubjects = subjects.filter((subject) => {
				if (!subject.isAdditional) {
					// Regular subject - always include
					return true;
				}
				// Additional subject - only include if student has opted in
				return optedInSubjectIds.includes(subject.id);
			});

			// Store filtered subjects for dialog rendering
			setDialogSubjects(filteredSubjects);

			// Initialize marks data
			const initialMarksData: MarksFormData = {};
			filteredSubjects.forEach((subject) => {
				const existingMark = existingResult?.subjectMarks.find(
					(sm: {
						subjectId: number;
						marksObtained: number;
						theoryMarks?: number;
						practicalMarks?: number;
					}) => sm.subjectId === subject.id
				);

				const selectedClass_obj = classes.find(
					(c) => c.id.toString() === selectedClass
				);
				const isTheoryPractical =
					selectedClass_obj && isTheoryPracticalClass(selectedClass_obj.name);

				if (isTheoryPractical && subject.hasPractical) {
					initialMarksData[subject.id] = {
						marks: "",
						theoryMarks: existingMark?.theoryMarks?.toString() || "",
						practicalMarks: existingMark?.practicalMarks?.toString() || "",
					};
				} else {
					initialMarksData[subject.id] = {
						marks: existingMark?.marksObtained?.toString() || "",
						theoryMarks: "",
						practicalMarks: "",
					};
				}
			});

			setMarksData(initialMarksData);
			setIsMarksDialogOpen(true);
		} catch (error) {
			console.error("Error fetching student result:", error);
			toast.error("Failed to load student data");
		}
	};

	const saveMarks = async () => {
		if (!selectedStudent) return;

		try {
			setSaving(true);

			const selectedClass_obj = classes.find(
				(c) => c.id.toString() === selectedClass
			);
			const isTheoryPractical =
				selectedClass_obj && isTheoryPracticalClass(selectedClass_obj.name);

			// Prepare marks data - only for subjects in the dialog (filtered by opt-in)
			const subjectMarks = dialogSubjects.map((subject) => {
				const marks = marksData[subject.id];

				if (isTheoryPractical && subject.hasPractical) {
					const theoryMarks = parseInt(marks?.theoryMarks || "0");
					const practicalMarks = parseInt(marks?.practicalMarks || "0");
					const totalMarks = theoryMarks + practicalMarks;

					return {
						subjectId: subject.id,
						marksObtained: totalMarks,
						theoryMarks,
						practicalMarks,
					};
				} else {
					const totalMarks = parseInt(marks?.marks || "0");
					return {
						subjectId: subject.id,
						marksObtained: totalMarks,
					};
				}
			});

			// Send to API
			const response = await fetch("/api/result/marks", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					studentId: selectedStudent.id,
					academicYear: selectedYear,
					marks: subjectMarks,
				}),
			});

			if (response.ok) {
				toast.success("Marks saved successfully");
				setIsMarksDialogOpen(false);
				setSelectedStudent(null);
				setMarksData({});
				setDialogSubjects([]);
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to save marks");
			}
		} catch (error) {
			console.error("Error saving marks:", error);
			toast.error("Failed to save marks");
		} finally {
			setSaving(false);
		}
	};

	const updateMarks = (subjectId: number, field: string, value: string) => {
		setMarksData((prev) => ({
			...prev,
			[subjectId]: {
				...prev[subjectId],
				[field]: value,
			},
		}));
	};

	const selectedClassObj = classes.find(
		(c) => c.id.toString() === selectedClass
	);

	return (
		<div className="space-y-6">
			{/* Search and Filter Bar */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Marks Entry & Management
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<Label htmlFor="classSelect">Select Class *</Label>
							<Select value={selectedClass} onValueChange={setSelectedClass}>
								<SelectTrigger>
									<SelectValue placeholder="Select class" />
								</SelectTrigger>
								<SelectContent>
									{classes.map((cls) => (
										<SelectItem key={cls.id} value={cls.id.toString()}>
											{cls.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="yearFilter">Academic Year</Label>
							<Select value={selectedYear} onValueChange={setSelectedYear}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{academicYears.map((year) => (
										<SelectItem key={year} value={year}>
											{year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="search">Search Student</Label>
							<Input
								id="search"
								placeholder="Search by name, roll number, or father's name..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								disabled={!selectedClass}
								className="w-full"
							/>
						</div>
					</div>
					{selectedClass && (
						<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
							<BookOpen className="h-4 w-4" />
							Class: {selectedClassObj?.name}
							<Users className="h-4 w-4 ml-4" />
							{filteredStudents.length} students
							<Badge variant="secondary">
								{selectedClassObj &&
								isTheoryPracticalClass(selectedClassObj.name)
									? "Theory + Practical"
									: "Traditional"}
							</Badge>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Students Table */}
			{selectedClass && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Students & Marks ({filteredStudents.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex justify-center py-8">
								<Loader2 className="h-8 w-8 animate-spin" />
							</div>
						) : filteredStudents.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
								{searchTerm
									? "No students found matching your search"
									: "No students found in this class"}
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Roll No</TableHead>
											<TableHead>Student Name</TableHead>
											<TableHead>Father&apos;s Name</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredStudents.map((student) => {
											return (
												<TableRow key={student.id}>
													<TableCell className="font-medium">
														{student.rollNumber}
													</TableCell>
													<TableCell>{student.name}</TableCell>
													<TableCell>{student.fatherName}</TableCell>
													<TableCell>
														<Button
															variant="outline"
															size="sm"
															onClick={() => openMarksDialog(student)}
															disabled={subjects.length === 0}
														>
															<BookOpen className="h-4 w-4 mr-1" />
															Enter Marks
														</Button>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Marks Entry Dialog */}
			<Dialog open={isMarksDialogOpen} onOpenChange={setIsMarksDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{selectedStudent && (
								<div className="space-y-2">
									<div>
										Enter Marks - {selectedStudent.name} (Roll:{" "}
										{selectedStudent.rollNumber})
									</div>
									<div className="text-sm text-muted-foreground">
										Class: {selectedClassObj?.name} | Academic Year:{" "}
										{selectedYear}
									</div>
								</div>
							)}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-6">
						{selectedClassObj &&
						isTheoryPracticalClass(selectedClassObj.name) ? (
							// Theory + Practical Interface (Classes 9-12)
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-sm font-medium">
									<AlertCircle className="h-4 w-4" />
									Theory + Practical System (Triple Pass Required)
								</div>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Subject</TableHead>
												<TableHead>Theory Marks</TableHead>
												<TableHead>Practical Marks</TableHead>
												<TableHead>Max Theory</TableHead>
												<TableHead>Max Practical</TableHead>
												<TableHead>Total Max</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{dialogSubjects.map((subject) => (
												<TableRow key={subject.id}>
													<TableCell className="font-medium">
														{subject.name}
													</TableCell>
													<TableCell>
														{subject.hasPractical ? (
															<Input
																type="number"
																min="0"
																max={subject.theoryMaxMarks || 0}
																value={marksData[subject.id]?.theoryMarks || ""}
																onChange={(e) =>
																	updateMarks(
																		subject.id,
																		"theoryMarks",
																		e.target.value
																	)
																}
																placeholder="0"
																className="w-20"
															/>
														) : (
															<Input
																type="number"
																min="0"
																max={subject.maxMarks}
																value={marksData[subject.id]?.marks || ""}
																onChange={(e) =>
																	updateMarks(
																		subject.id,
																		"marks",
																		e.target.value
																	)
																}
																placeholder="0"
																className="w-20"
															/>
														)}
													</TableCell>
													<TableCell>
														{subject.hasPractical ? (
															<Input
																type="number"
																min="0"
																max={subject.practicalMaxMarks || 0}
																value={
																	marksData[subject.id]?.practicalMarks || ""
																}
																onChange={(e) =>
																	updateMarks(
																		subject.id,
																		"practicalMarks",
																		e.target.value
																	)
																}
																placeholder="0"
																className="w-20"
															/>
														) : (
															<span className="text-muted-foreground">N/A</span>
														)}
													</TableCell>
													<TableCell>
														{subject.hasPractical
															? subject.theoryMaxMarks
															: subject.maxMarks}
													</TableCell>
													<TableCell>
														{subject.hasPractical
															? subject.practicalMaxMarks
															: "N/A"}
													</TableCell>
													<TableCell className="font-medium">
														{subject.hasPractical
															? (subject.theoryMaxMarks || 0) +
															  (subject.practicalMaxMarks || 0)
															: subject.maxMarks}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</div>
						) : (
							// Traditional Interface (Nursery-8th)
							<div className="space-y-4">
								<div className="flex items-center gap-2 text-sm font-medium">
									<BookOpen className="h-4 w-4" />
									Traditional Marking System
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{dialogSubjects.map((subject) => (
										<div key={subject.id} className="space-y-2">
											<Label htmlFor={`marks-${subject.id}`}>
												{subject.name} (Max: {subject.maxMarks})
											</Label>
											<Input
												id={`marks-${subject.id}`}
												type="number"
												min="0"
												max={subject.maxMarks}
												value={marksData[subject.id]?.marks || ""}
												onChange={(e) =>
													updateMarks(subject.id, "marks", e.target.value)
												}
												placeholder="0"
											/>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="text-xs text-muted-foreground bg-muted p-3 rounded">
							<strong>Note:</strong>{" "}
							{selectedClassObj && isTheoryPracticalClass(selectedClassObj.name)
								? "For classes 9-12: Students must pass theory (33%), practical (33%), and total (33%) separately."
								: "For Nursery-8th: Students must score at least 33% in each subject to pass."}
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsMarksDialogOpen(false);
								setSelectedStudent(null);
								setMarksData({});
								setDialogSubjects([]);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={saveMarks}
							disabled={saving || subjects.length === 0}
						>
							{saving ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Save Marks
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
