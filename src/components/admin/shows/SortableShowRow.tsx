"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming utils exist

interface SortableShowRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    id: string;
    isDraggable?: boolean;
}

export function SortableShowRow({
    id,
    isDraggable = false,
    children,
    className,
    ...props
}: SortableShowRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: !isDraggable });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={cn(isDragging ? "opacity-50 bg-accent z-50 relative" : "", className)}
            {...props}
        >
            {isDraggable && (
                <TableCell className="w-[50px]">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-move p-2 hover:bg-muted rounded text-muted-foreground w-fit"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                </TableCell>
            )}
            {children}
        </TableRow>
    );
}
