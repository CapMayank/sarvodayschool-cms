/** @format */

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	GraduationCap,
	Users,
	FileSpreadsheet,
	Settings,
	Calendar,
} from "lucide-react";
import ClassManagement from "@/components/dashboard/result/ClassManagement";
import StudentManagement from "@/components/dashboard/result/StudentManagement";
import MarksManagement from "@/components/dashboard/result/MarksManagement";
import BulkUpload from "@/components/dashboard/result/BulkUpload";
import PublicationControl from "@/components/dashboard/result/PublicationControl";

export default function ResultManagementPage() {
	const [activeTab, setActiveTab] = useState("classes");

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-3">
				<h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
					Result Management System
				</h1>
				<p className="text-lg text-slate-600 font-medium">
					Manage annual examination results, classes, subjects, and students
				</p>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
					<TabsTrigger value="classes" className="flex items-center gap-2">
						<GraduationCap className="h-4 w-4" />
						<span className="hidden sm:inline">Classes & Subjects</span>
						<span className="sm:hidden">Classes</span>
					</TabsTrigger>
					<TabsTrigger value="students" className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						<span className="hidden sm:inline">Students</span>
						<span className="sm:hidden">Students</span>
					</TabsTrigger>
					<TabsTrigger value="marks" className="flex items-center gap-2">
						<FileSpreadsheet className="h-4 w-4" />
						<span className="hidden sm:inline">Marks Entry</span>
						<span className="sm:hidden">Marks</span>
					</TabsTrigger>
					<TabsTrigger value="bulk" className="flex items-center gap-2">
						<FileSpreadsheet className="h-4 w-4" />
						<span className="hidden sm:inline">Bulk Upload</span>
						<span className="sm:hidden">Upload</span>
					</TabsTrigger>
					<TabsTrigger value="publication" className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						<span className="hidden sm:inline">Publication</span>
						<span className="sm:hidden">Publish</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="classes">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<GraduationCap className="h-5 w-5" />
								Class & Subject Configuration
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ClassManagement />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="students">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Student Management
							</CardTitle>
						</CardHeader>
						<CardContent>
							<StudentManagement />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="marks">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileSpreadsheet className="h-5 w-5" />
								Marks Entry
							</CardTitle>
						</CardHeader>
						<CardContent>
							<MarksManagement />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="bulk">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileSpreadsheet className="h-5 w-5" />
								Bulk Upload Results
							</CardTitle>
						</CardHeader>
						<CardContent>
							<BulkUpload />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="publication">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								Result Publication Control
							</CardTitle>
						</CardHeader>
						<CardContent>
							<PublicationControl />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
