/** @format */

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function MarksManagement() {
	const [loading] = useState(false);

	return (
		<div className="space-y-6">
			<div className="text-center py-12">
				{loading ? (
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
				) : (
					<div className="space-y-4">
						<p className="text-gray-500">
							Marks entry interface
						</p>
						<p className="text-sm text-gray-400">
							Enter marks individually or use the Bulk Upload tab to import all results at once via Excel.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
