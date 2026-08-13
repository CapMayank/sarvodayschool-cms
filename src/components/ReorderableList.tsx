/** @format */

"use client";

import React, {
	useState,
	useCallback,
	useEffect,
	useRef,
} from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	TouchSensor,
	MouseSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	DragStartEvent,
	DragOverlay,
	defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReorderableItemBase {
	id: number;
	order?: number;
}

interface ReorderableListProps<T extends ReorderableItemBase> {
	items: T[];
	onReorder: (items: T[]) => Promise<void> | void;
	children: (item: T, index: number) => React.ReactNode;
	className?: string;
}

type SaveState = "idle" | "saving" | "saved";

interface SortableItemProps<T extends ReorderableItemBase> {
	id: string;
	item: T;
	index: number;
	children: React.ReactNode;
	isDragOverlay?: boolean;
}

/** ——— Individual sortable item ——— */
function SortableItem<T extends ReorderableItemBase>({
	id,
	index,
	children,
	isDragOverlay = false,
}: SortableItemProps<T>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = isDragOverlay
		? undefined
		: { transform: CSS.Transform.toString(transform), transition };

	return (
		<div
			ref={isDragOverlay ? undefined : setNodeRef}
			style={style}
			className={cn(
				"group bg-card border rounded-xl transition-all duration-150 overflow-hidden",
				isDragging && !isDragOverlay && "opacity-30 scale-[0.98] shadow-none",
				isDragOverlay &&
					"shadow-2xl ring-2 ring-primary/30 rotate-1 scale-[1.02] z-50",
				!isDragOverlay &&
					!isDragging &&
					"hover:shadow-sm hover:border-muted-foreground/20"
			)}
		>
			<div className="flex items-center gap-0">
				{/* Position badge column */}
				<div className="shrink-0 w-10 flex flex-col items-center justify-center self-stretch bg-muted/40 border-r">
					<span
						className={cn(
							"text-xs font-bold tabular-nums",
							isDragOverlay ? "text-primary" : "text-muted-foreground"
						)}
					>
						{index + 1}
					</span>
				</div>

				{/* Drag handle column */}
				<div
					{...(isDragOverlay ? {} : { ...attributes, ...listeners })}
					className={cn(
						"shrink-0 self-stretch flex items-center justify-center px-2 border-r transition-colors",
						isDragOverlay
							? "cursor-grabbing text-primary bg-primary/5"
							: "cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted/50"
					)}
					title="Drag to reorder"
				>
					<GripVertical className="w-4 h-4" />
				</div>

				{/* Content */}
				<div className="grow overflow-hidden min-w-0 py-3 px-3">
					{children}
				</div>
			</div>
		</div>
	);
}

/** ——— Main reorderable list component ——— */
function ReorderableListComponent<T extends ReorderableItemBase>(
	{ items, onReorder, children, className }: ReorderableListProps<T>,
	ref: React.ForwardedRef<HTMLDivElement>
) {
	const [displayItems, setDisplayItems] = useState<T[]>(items);
	const [saveState, setSaveState] = useState<SaveState>("idle");
	const [activeId, setActiveId] = useState<string | null>(null);
	const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isReorderingRef = useRef(false);

	// Sync display when items change externally (add / delete / initial load)
	// Skip sync during active reorder to avoid fighting the optimistic update
	const prevIdsKey = useRef<string>("");
	useEffect(() => {
		const key = items
			.map((i) => i.id)
			.sort()
			.join(",");
		if (!isReorderingRef.current && prevIdsKey.current !== key) {
			prevIdsKey.current = key;
			setDisplayItems(items);
		}
	}, [items]);

	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveId(null);
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const oldIndex = displayItems.findIndex(
				(item) => item.id.toString() === active.id
			);
			const newIndex = displayItems.findIndex(
				(item) => item.id.toString() === over.id
			);
			if (oldIndex === -1 || newIndex === -1) return;

			const newItems = arrayMove(displayItems, oldIndex, newIndex).map(
				(item, idx) => ({ ...item, order: idx })
			);

			// Optimistic update – instant visual response
			isReorderingRef.current = true;
			setDisplayItems(newItems);
			setSaveState("saving");

			// Debounce API call (300ms) to batch rapid drags
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
			saveTimerRef.current = setTimeout(async () => {
				try {
					await onReorder(newItems);
					setSaveState("saved");
					setTimeout(() => {
						setSaveState("idle");
						isReorderingRef.current = false;
					}, 2000);
				} catch {
					// Rollback on error
					setDisplayItems(items);
					setSaveState("idle");
					isReorderingRef.current = false;
				}
			}, 300);
		},
		[displayItems, items, onReorder]
	);

	const activeItem = activeId
		? displayItems.find((item) => item.id.toString() === activeId)
		: null;
	const activeIndex = activeItem ? displayItems.indexOf(activeItem) : -1;

	return (
		<div className={cn("space-y-2", className)}>
			{/* Non-blocking save status pill */}
			<div
				className={cn(
					"flex items-center gap-1.5 text-xs transition-all duration-300 h-5",
					saveState === "idle" ? "opacity-0" : "opacity-100"
				)}
			>
				{saveState === "saving" ? (
					<>
						<Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
						<span className="text-muted-foreground">Saving order…</span>
					</>
				) : (
					<>
						<CheckCircle2 className="w-3 h-3 text-green-500" />
						<span className="text-green-600 dark:text-green-400">
							Order saved
						</span>
					</>
				)}
			</div>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={displayItems.map((item) => item.id.toString())}
					strategy={verticalListSortingStrategy}
				>
					<div ref={ref} className="space-y-2">
						{displayItems.length === 0 ? (
							<div className="text-center py-10 text-muted-foreground text-sm">
								No items to display
							</div>
						) : (
							displayItems.map((item, index) => (
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

				{/* Drag ghost overlay */}
				<DragOverlay
					dropAnimation={{
						sideEffects: defaultDropAnimationSideEffects({
							styles: { active: { opacity: "0.3" } },
						}),
					}}
				>
					{activeItem ? (
						<SortableItem<T>
							id={activeItem.id.toString()}
							item={activeItem}
							index={activeIndex}
							isDragOverlay
						>
							{children(activeItem, activeIndex)}
						</SortableItem>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

// Preserve proper generic forwardRef typing
const ReorderableList = React.forwardRef(ReorderableListComponent) as <
	T extends ReorderableItemBase
>(
	props: ReorderableListProps<T> & {
		ref?: React.ForwardedRef<HTMLDivElement>;
	}
) => React.ReactElement | null;

export default ReorderableList;
