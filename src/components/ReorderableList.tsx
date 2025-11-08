/** @format */

"use client";

import React, { useState, useCallback } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	TouchSensor,
	MouseSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ReorderableItemBase {
	id: number;
	order?: number;
}

interface ReorderableListProps<T extends ReorderableItemBase> {
	items: T[];
	onReorder: (items: T[]) => void;
	children: (item: T, index: number) => React.ReactNode;
}

interface SortableItemProps<T extends ReorderableItemBase> {
	id: string;
	item: T;
	index: number;
	children: React.ReactNode;
}

// Sortable Item Component
function SortableItem<T extends ReorderableItemBase>({
	id,
	children,
}: SortableItemProps<T>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`bg-white border-2 rounded-lg p-4 transition-all select-none ${
				isDragging
					? "border-blue-500 shadow-lg bg-blue-50 scale-105 rotate-2"
					: "border-gray-200 hover:border-gray-300"
			}`}
		>
			<div className="flex items-start gap-4">
				{/* Drag Handle */}
				<div
					{...attributes}
					{...listeners}
					className="shrink-0 cursor-grab active:cursor-grabbing pt-1 hover:text-gray-600 touch-manipulation p-1 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
					title="Drag to reorder"
				>
					<svg
						className="w-6 h-6 text-gray-400"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M8 5a2 2 0 11-4 0 2 2 0 014 0zM8 15a2 2 0 11-4 0 2 2 0 014 0zM14 5a2 2 0 11-4 0 2 2 0 014 0zM14 15a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</div>

				{/* Content */}
				<div className="grow">{children}</div>
			</div>
		</div>
	);
}

// Main Component - Now truly generic
function ReorderableListComponent<T extends ReorderableItemBase>(
	{ items, onReorder, children }: ReorderableListProps<T>,
	ref: React.ForwardedRef<HTMLDivElement>
) {
	const [isLoading, setIsLoading] = useState(false);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event;

			if (!over || active.id === over.id) {
				return;
			}

			const oldIndex = items.findIndex(
				(item) => item.id.toString() === active.id
			);
			const newIndex = items.findIndex(
				(item) => item.id.toString() === over.id
			);

			if (oldIndex === -1 || newIndex === -1) {
				return;
			}

			const newItems = arrayMove(items, oldIndex, newIndex);

			const updatedItems = newItems.map((item, index) => ({
				...item,
				order: index,
			}));

			setIsLoading(true);
			try {
				await onReorder(updatedItems);
			} catch (error) {
				console.error("Error reordering items:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[items, onReorder]
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={items.map((item) => item.id.toString())}
				strategy={verticalListSortingStrategy}
			>
				<div
					ref={ref}
					className={`space-y-2 p-2 rounded-lg bg-gray-50 ${
						isLoading ? "opacity-50 pointer-events-none" : ""
					}`}
				>
					{items.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<p>No items to reorder</p>
						</div>
					) : (
						items.map((item, index) => (
							<SortableItem<T>
								key={item.id}
								id={item.id.toString()}
								item={item}
								index={index}
							>
								{children(item, index)}
							</SortableItem>
						))
					)}
				</div>
			</SortableContext>
		</DndContext>
	);
}

// Apply forwardRef with proper generic typing
const ReorderableList = React.forwardRef(ReorderableListComponent) as <
	T extends ReorderableItemBase
>(
	props: ReorderableListProps<T> & {
		ref?: React.ForwardedRef<HTMLDivElement>;
	}
) => React.ReactElement | null;

export default ReorderableList;
