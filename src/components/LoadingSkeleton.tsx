/** @format */

export function GalleryCardSkeleton() {
	return (
		<div className="rounded-xl bg-white shadow-lg overflow-hidden animate-pulse">
			<div className="h-64 bg-gray-200" />
		</div>
	);
}

// export function ImageGridSkeleton() {
// 	return (
// 		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// 			{Array.from({ length: 12 }).map((_, i) => (
// 				<div
// 					key={i}
// 					className="aspect-square bg-gray-200 rounded-lg animate-pulse"
// 				/>
// 			))}
// 		</div>
// 	);
// }

// export function CategoryGridSkeleton() {
// 	return (
// 		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// 			{Array.from({ length: 5 }).map((_, i) => (
// 				<div
// 					key={i}
// 					className="rounded-xl bg-white shadow-lg overflow-hidden animate-pulse"
// 				>
// 					<div className="h-64 bg-gray-200" />
// 				</div>
// 			))}
// 		</div>
// 	);
// }

export function ImageGridSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{Array.from({ length: 12 }).map((_, i) => (
				<div
					key={i}
					className="aspect-square bg-gray-200 rounded-lg relative overflow-hidden"
				>
					<div
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
						style={{
							backgroundSize: "200% 100%",
							animation: "shimmer 2s infinite",
						}}
					/>
				</div>
			))}
		</div>
	);
}

export function CategoryGridSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{Array.from({ length: 5 }).map((_, i) => (
				<div key={i} className="rounded-xl bg-white shadow-lg overflow-hidden">
					<div className="h-64 bg-gray-200 relative overflow-hidden">
						<div
							className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
							style={{
								backgroundSize: "200% 100%",
								animation: "shimmer 2s infinite",
							}}
						/>
					</div>
				</div>
			))}
		</div>
	);
}
