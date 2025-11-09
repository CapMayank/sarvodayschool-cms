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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Edit, Trash2, Plus, Filter } from "lucide-react";
import { toast } from "sonner";

interface Class {
	id: number;
	name: string;
	hasPractical: boolean;
	subjects?: Array<{
		id: number;
		name: string;
		isAdditional: boolean;
	}>;
}

interface Student {
	id: number;
	rollNumber: string;
	enrollmentNo?: string;
	name: string;
	fatherName: string;
	dateOfBirth?: string;
	academicYear: string;
	class: Class;
	classId: number;
}

interface StudentFormData {
	rollNumber: string;
	enrollmentNo: string;
	name: string;
	fatherName: string;
	dateOfBirth: string;
	classId: string;
	academicYear: string;
	optedSubjectIds: number[]; // Track opted-in additional subjects
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

export default function StudentManagement() {
	const [students, setStudents] = useState<Student[]>([]);
	const [classes, setClasses] = useState<Class[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedClass, setSelectedClass] = useState("");
	const [selectedYear, setSelectedYear] = useState(currentAcademicYear);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingStudent, setEditingStudent] = useState<Student | null>(null);
	const [formData, setFormData] = useState<StudentFormData>({
		rollNumber: "",
		enrollmentNo: "",
		name: "",
		fatherName: "",
		dateOfBirth: "",
		classId: "",
		academicYear: currentAcademicYear,
		optedSubjectIds: [],
	});

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

	const fetchClasses = async () => {
		try {
			const response = await fetch("/api/result/classes");
			if (response.ok) {
				const data = await response.json();
				// Fetch subjects for each class
				const classesWithSubjects = await Promise.all(
					data.classes.map(async (cls: Class) => {
						const subjectsResponse = await fetch(
							`/api/result/classes/${cls.id}/subjects`
						);
						if (subjectsResponse.ok) {
							const subjectsData = await subjectsResponse.json();
							return {
								...cls,
								subjects: subjectsData.subjects,
							};
						}
						return cls;
					})
				);
				setClasses(classesWithSubjects);
			}
		} catch (error) {
			console.error("Error fetching classes:", error);
		}
	};

	const fetchStudents = useCallback(async () => {
		try {
			setLoading(true);

			// Only fetch students if a class is selected
			if (!selectedClass || selectedClass === "") {
				setStudents([]);
				setLoading(false);
				return;
			}

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
	}, [selectedYear, selectedClass]);

	useEffect(() => {
		fetchClasses();
		fetchStudents();
	}, [selectedClass, selectedYear, fetchStudents]);

	const filteredStudents = students.filter((student) => {
		const matchesSearch =
			student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(student.enrollmentNo &&
				student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()));

		return matchesSearch;
	});

	const resetForm = () => {
		setFormData({
			rollNumber: "",
			enrollmentNo: "",
			name: "",
			fatherName: "",
			dateOfBirth: "",
			classId: "",
			academicYear: currentAcademicYear,
			optedSubjectIds: [],
		});
	};

	const handleAddStudent = async () => {
		try {
			const response = await fetch("/api/result/students", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					classId: parseInt(formData.classId),
				}),
			});

			if (response.ok) {
				const data = await response.json();
				const newStudent = data.student;

				// Save opted-in additional subjects
				if (formData.optedSubjectIds.length > 0) {
					for (const subjectId of formData.optedSubjectIds) {
						await fetch("/api/result/subject-opt-ins", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								studentId: newStudent.id,
								subjectId,
							}),
						});
					}
				}

				toast.success("Student added successfully");
				setIsAddDialogOpen(false);
				resetForm();
				fetchStudents();
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to add student");
			}
		} catch (error) {
			console.error("Error adding student:", error);
			toast.error("Failed to add student");
		}
	};

	const handleEditStudent = async () => {
		if (!editingStudent) return;

		try {
			const response = await fetch(
				`/api/result/students/${editingStudent.id}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						...formData,
						classId: parseInt(formData.classId),
					}),
				}
			);

			if (response.ok) {
				// First, fetch current opt-ins
				const optInParams = new URLSearchParams({
					studentId: editingStudent.id.toString(),
				});
				const currentOptIns = await fetch(
					`/api/result/subject-opt-ins?${optInParams}`
				);
				let currentOptInIds: number[] = [];

				if (currentOptIns.ok) {
					const data = await currentOptIns.json();
					currentOptInIds = data.optIns.map(
						(opt: { subjectId: number }) => opt.subjectId
					);
				}

				// Find subjects to add
				const toAdd = formData.optedSubjectIds.filter(
					(id) => !currentOptInIds.includes(id)
				);
				// Find subjects to remove
				const toRemove = currentOptInIds.filter(
					(id) => !formData.optedSubjectIds.includes(id)
				);

				// Add new opt-ins
				for (const subjectId of toAdd) {
					await fetch("/api/result/subject-opt-ins", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							studentId: editingStudent.id,
							subjectId,
						}),
					});
				}

				// Remove opt-ins
				for (const subjectId of toRemove) {
					const deleteParams = new URLSearchParams({
						studentId: editingStudent.id.toString(),
						subjectId: subjectId.toString(),
					});
					await fetch(`/api/result/subject-opt-ins?${deleteParams}`, {
						method: "DELETE",
					});
				}

				toast.success("Student updated successfully");
				setIsEditDialogOpen(false);
				setEditingStudent(null);
				resetForm();
				fetchStudents();
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to update student");
			}
		} catch (error) {
			console.error("Error updating student:", error);
			toast.error("Failed to update student");
		}
	};

	const handleDeleteStudent = async (student: Student) => {
		if (
			!confirm(
				`Are you sure you want to delete student ${student.name}? This action cannot be undone.`
			)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/result/students/${student.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Student deleted successfully");
				fetchStudents();
			} else {
				const error = await response.json();
				toast.error(error.error || "Failed to delete student");
			}
		} catch (error) {
			console.error("Error deleting student:", error);
			toast.error("Failed to delete student");
		}
	};

	const openEditDialog = async (student: Student) => {
		setEditingStudent(student);

		// Fetch student's opted-in subjects
		try {
			const optInParams = new URLSearchParams({
				studentId: student.id.toString(),
			});
			const optInResponse = await fetch(
				`/api/result/subject-opt-ins?${optInParams}`
			);
			let optedSubjectIds: number[] = [];

			if (optInResponse.ok) {
				const optInData = await optInResponse.json();
				optedSubjectIds = optInData.optIns.map(
					(opt: { subjectId: number }) => opt.subjectId
				);
			}

			setFormData({
				rollNumber: student.rollNumber,
				enrollmentNo: student.enrollmentNo || "",
				name: student.name,
				fatherName: student.fatherName,
				dateOfBirth: student.dateOfBirth
					? new Date(student.dateOfBirth).toISOString().split("T")[0]
					: "",
				classId: student.classId.toString(),
				academicYear: student.academicYear,
				optedSubjectIds,
			});
			setIsEditDialogOpen(true);
		} catch (error) {
			console.error("Error loading student data:", error);
			toast.error("Failed to load student data");
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-IN");
	};

	return (
		<div className="space-y-6">
			{/* Search and Filter Bar */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="h-5 w-5" />
						Search & Filter Students
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<Label htmlFor="search">Search by Name/Roll/Father Name</Label>
							<Input
								id="search"
								placeholder="Enter name, roll number..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="classFilter">Filter by Class</Label>
							<Select value={selectedClass} onValueChange={setSelectedClass}>
								<SelectTrigger>
									<SelectValue placeholder="Select a class" />
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
						<div className="flex items-end">
							<Button
								onClick={() => setIsAddDialogOpen(true)}
								className="w-full"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Student
							</Button>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Filter className="h-4 w-4" />
						{filteredStudents.length} of {students.length} students shown
						{selectedClass && selectedClass !== "" && (
							<Badge variant="secondary">
								Class:{" "}
								{classes.find((c) => c.id.toString() === selectedClass)?.name}
							</Badge>
						)}
						<Badge variant="secondary">Year: {selectedYear}</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Students Table */}
			<Card>
				<CardHeader>
					<CardTitle>Students ({filteredStudents.length})</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : filteredStudents.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							{!selectedClass || selectedClass === ""
								? "Please select a class to view students"
								: searchTerm
								? "No students found matching your search criteria"
								: "No students found in the selected class."}
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Roll Number</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Father&apos;s Name</TableHead>
										<TableHead>Class</TableHead>
										<TableHead>Enrollment No</TableHead>
										<TableHead>Date of Birth</TableHead>
										<TableHead>Academic Year</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredStudents.map((student) => (
										<TableRow key={student.id}>
											<TableCell className="font-medium">
												{student.rollNumber}
											</TableCell>
											<TableCell>{student.name}</TableCell>
											<TableCell>{student.fatherName}</TableCell>
											<TableCell>
												<Badge variant="outline">{student.class.name}</Badge>
											</TableCell>
											<TableCell>{student.enrollmentNo || "N/A"}</TableCell>
											<TableCell>
												{formatDate(student.dateOfBirth || "")}
											</TableCell>
											<TableCell>{student.academicYear}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => openEditDialog(student)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDeleteStudent(student)}
													>
														<Trash2 className="h-4 w-4 text-red-500" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Student Dialog */}
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add New Student</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="rollNumber">Roll Number *</Label>
							<Input
								id="rollNumber"
								value={formData.rollNumber}
								onChange={(e) =>
									setFormData({ ...formData, rollNumber: e.target.value })
								}
								placeholder="Enter roll number"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="name">Student Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Enter student name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="fatherName">Father&apos;s Name *</Label>
							<Input
								id="fatherName"
								value={formData.fatherName}
								onChange={(e) =>
									setFormData({ ...formData, fatherName: e.target.value })
								}
								placeholder="Enter father's name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="class">Class *</Label>
							<Select
								value={formData.classId}
								onValueChange={(value) =>
									setFormData({ ...formData, classId: value })
								}
							>
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
							<Label htmlFor="enrollmentNo">Enrollment Number</Label>
							<Input
								id="enrollmentNo"
								value={formData.enrollmentNo}
								onChange={(e) =>
									setFormData({ ...formData, enrollmentNo: e.target.value })
								}
								placeholder="Enter enrollment number"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="dateOfBirth">Date of Birth</Label>
							<Input
								id="dateOfBirth"
								type="date"
								value={formData.dateOfBirth}
								onChange={(e) =>
									setFormData({ ...formData, dateOfBirth: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="academicYear">Academic Year *</Label>
							<Select
								value={formData.academicYear}
								onValueChange={(value) =>
									setFormData({ ...formData, academicYear: value })
								}
							>
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

						{/* Additional Subjects Selection (for classes 11-12 only) */}
						{formData.classId &&
							(() => {
								const selectedClass = classes.find(
									(c) => c.id.toString() === formData.classId
								);
								const additionalSubjects =
									selectedClass?.subjects?.filter((s) => s.isAdditional) || [];

								if (additionalSubjects.length > 0) {
									return (
										<div className="space-y-2 border-t pt-4">
											<Label className="text-base">
												Optional/Additional Subjects
											</Label>
											<p className="text-sm text-muted-foreground">
												Select the additional subjects this student will take:
											</p>
											<div className="space-y-2">
												{additionalSubjects.map((subject) => (
													<div
														key={subject.id}
														className="flex items-center space-x-2"
													>
														<Checkbox
															id={`add-subject-${subject.id}`}
															checked={formData.optedSubjectIds.includes(
																subject.id
															)}
															onCheckedChange={(checked) => {
																if (checked) {
																	setFormData({
																		...formData,
																		optedSubjectIds: [
																			...formData.optedSubjectIds,
																			subject.id,
																		],
																	});
																} else {
																	setFormData({
																		...formData,
																		optedSubjectIds:
																			formData.optedSubjectIds.filter(
																				(id) => id !== subject.id
																			),
																	});
																}
															}}
														/>
														<label
															htmlFor={`add-subject-${subject.id}`}
															className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
														>
															{subject.name}
														</label>
													</div>
												))}
											</div>
										</div>
									);
								}
								return null;
							})()}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsAddDialogOpen(false);
								resetForm();
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddStudent}
							disabled={
								!formData.rollNumber ||
								!formData.name ||
								!formData.fatherName ||
								!formData.classId ||
								!formData.academicYear
							}
						>
							Add Student
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Student Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Student</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="editRollNumber">Roll Number *</Label>
							<Input
								id="editRollNumber"
								value={formData.rollNumber}
								onChange={(e) =>
									setFormData({ ...formData, rollNumber: e.target.value })
								}
								placeholder="Enter roll number"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="editName">Student Name *</Label>
							<Input
								id="editName"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Enter student name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="editFatherName">Father&apos;s Name *</Label>
							<Input
								id="editFatherName"
								value={formData.fatherName}
								onChange={(e) =>
									setFormData({ ...formData, fatherName: e.target.value })
								}
								placeholder="Enter father's name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="editClass">Class *</Label>
							<Select
								value={formData.classId}
								onValueChange={(value) =>
									setFormData({ ...formData, classId: value })
								}
							>
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
							<Label htmlFor="editEnrollmentNo">Enrollment Number</Label>
							<Input
								id="editEnrollmentNo"
								value={formData.enrollmentNo}
								onChange={(e) =>
									setFormData({ ...formData, enrollmentNo: e.target.value })
								}
								placeholder="Enter enrollment number"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="editDateOfBirth">Date of Birth</Label>
							<Input
								id="editDateOfBirth"
								type="date"
								value={formData.dateOfBirth}
								onChange={(e) =>
									setFormData({ ...formData, dateOfBirth: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="editAcademicYear">Academic Year *</Label>
							<Select
								value={formData.academicYear}
								onValueChange={(value) =>
									setFormData({ ...formData, academicYear: value })
								}
							>
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

						{/* Additional Subjects Selection (for classes 11-12 only) */}
						{formData.classId &&
							(() => {
								const selectedClass = classes.find(
									(c) => c.id.toString() === formData.classId
								);
								const additionalSubjects =
									selectedClass?.subjects?.filter((s) => s.isAdditional) || [];

								if (additionalSubjects.length > 0) {
									return (
										<div className="space-y-2 border-t pt-4">
											<Label className="text-base">
												Optional/Additional Subjects
											</Label>
											<p className="text-sm text-muted-foreground">
												Select the additional subjects this student will take:
											</p>
											<div className="space-y-2">
												{additionalSubjects.map((subject) => (
													<div
														key={subject.id}
														className="flex items-center space-x-2"
													>
														<Checkbox
															id={`edit-subject-${subject.id}`}
															checked={formData.optedSubjectIds.includes(
																subject.id
															)}
															onCheckedChange={(checked) => {
																if (checked) {
																	setFormData({
																		...formData,
																		optedSubjectIds: [
																			...formData.optedSubjectIds,
																			subject.id,
																		],
																	});
																} else {
																	setFormData({
																		...formData,
																		optedSubjectIds:
																			formData.optedSubjectIds.filter(
																				(id) => id !== subject.id
																			),
																	});
																}
															}}
														/>
														<label
															htmlFor={`edit-subject-${subject.id}`}
															className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
														>
															{subject.name}
														</label>
													</div>
												))}
											</div>
										</div>
									);
								}
								return null;
							})()}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsEditDialogOpen(false);
								setEditingStudent(null);
								resetForm();
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleEditStudent}
							disabled={
								!formData.rollNumber ||
								!formData.name ||
								!formData.fatherName ||
								!formData.classId ||
								!formData.academicYear
							}
						>
							Update Student
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
