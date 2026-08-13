import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
	if (totalPages <= 1) return null;

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

	return (
		<div className="flex items-center justify-center space-x-2 py-4">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
			>
				<ChevronLeft className="w-4 h-4 mr-1" />
				Previous
			</Button>

			<div className="flex items-center space-x-1">
				{pages.map((page) => (
					<Button
						key={page}
						variant={currentPage === page ? "default" : "outline"}
						size="sm"
						className={`w-8 h-8 p-0 ${
							currentPage === page ? "bg-red-600 hover:bg-red-700 text-white" : ""
						}`}
						onClick={() => onPageChange(page)}
					>
						{page}
					</Button>
				))}
			</div>

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
			>
				Next
				<ChevronRight className="w-4 h-4 ml-1" />
			</Button>
		</div>
	);
}
