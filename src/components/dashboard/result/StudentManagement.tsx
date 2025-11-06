/** @format */

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function StudentManagement() {
	const [loading] = useState(false);

	return (
		<div className="space-y-6">
			<div className="text-center py-12">
				{loading ? (
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
				) : (
					<div className="space-y-4">
						<p className="text-gray-500">
							Student management interface
						</p>
						<p className="text-sm text-gray-400">
							Students can be added via bulk upload or individually. Use the Bulk Upload tab to import student data with results.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
