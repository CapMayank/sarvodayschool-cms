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
import { GripVertical } from "lucide-react";

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
			className={`bg-card text-card-foreground border rounded-xl p-4 transition-all select-none ${
				isDragging
					? "border-primary shadow-xl ring-1 ring-primary/20 scale-[1.02] rotate-1 z-50 opacity-90"
					: "border-border hover:border-muted-foreground/30 hover:shadow-sm"
			}`}
		>
			<div className="flex items-center gap-4">
				{/* Drag Handle */}
				<div
					{...attributes}
					{...listeners}
					className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-manipulation p-2 rounded-md hover:bg-muted active:bg-muted/80 transition-colors flex items-center justify-center"
					title="Drag to reorder"
				>
					<GripVertical className="w-5 h-5" />
				</div>

				{/* Content */}
				<div className="grow overflow-hidden">{children}</div>
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
					className={`space-y-3 p-1 ${
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
