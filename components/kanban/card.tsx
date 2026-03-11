"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Calendar, MessageSquare, Paperclip, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { labelColorMap } from "./label-popover";
import type { CardDetail } from "@/types/api";

interface KanbanCardProps {
  card: CardDetail;
  isDragging?: boolean;
  onDelete: (cardId: string) => void;
  onUpdate: (cardId: string, title: string) => void;
  onOpenDetail: (cardId: string) => void;
}

export function KanbanCard({
  card,
  isDragging = false,
  onDelete,
  onOpenDetail,
}: KanbanCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDeadlineSoon =
    card.deadline &&
    new Date(card.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isOverdue = card.deadline && new Date(card.deadline) < new Date();

  const labels = card.labels ?? [];
  const commentCount = card._count?.comments ?? 0;
  const attachmentCount = card._count?.attachments ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative rounded-lg bg-white dark:bg-zinc-800",
        "border border-zinc-200/60 dark:border-zinc-700/40",
        "cursor-default select-none transition-all duration-150",
        isSortableDragging || isDragging
          ? "opacity-50 shadow-lg ring-2 ring-blue-500/20 scale-[1.02]"
          : "shadow-sm hover:shadow-md hover:border-zinc-300/80 dark:hover:border-zinc-600/60 hover:-translate-y-px"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-2.5 cursor-grab rounded p-0.5 text-zinc-200 dark:text-zinc-700 opacity-0 group-hover:opacity-100 active:cursor-grabbing focus:outline-none transition-opacity"
        tabIndex={-1}
        aria-label="Drag card"
      >
        <GripVertical className="h-3 w-3" />
      </button>

      <div
        className="px-3 py-2 pl-5 cursor-pointer"
        onClick={() => onOpenDetail(card.id)}
      >
        {/* Label chips */}
        {labels.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {labels.map((label) => {
              const colors = labelColorMap[label.color] ?? labelColorMap.blue;
              return (
                <span
                  key={label.id}
                  className={cn("h-1.5 w-8 rounded-full", colors.dot)}
                  title={label.name || label.color}
                />
              );
            })}
          </div>
        )}

        <p className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug break-words">
          {card.title}
        </p>

        {card.description && (
          <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        )}

        {/* Meta row */}
        {(card.deadline || card.assignee || commentCount > 0 || attachmentCount > 0) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {card.deadline && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  isOverdue
                    ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : isDeadlineSoon
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-zinc-50 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                )}
              >
                <Calendar className="h-2.5 w-2.5" />
                {new Date(card.deadline).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}

            {commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                <MessageSquare className="h-3 w-3" />
                {commentCount}
              </span>
            )}

            {attachmentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                <Paperclip className="h-3 w-3" />
                {attachmentCount}
              </span>
            )}

            {card.assignee && (
              <span className="ml-auto">
                {card.assignee.image ? (
                  <img
                    src={card.assignee.image}
                    alt={card.assignee.name ?? ""}
                    className="h-5 w-5 rounded-full ring-1 ring-white dark:ring-zinc-800"
                  />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[9px] font-semibold text-white ring-1 ring-white dark:ring-zinc-800">
                    {(card.assignee.name ?? card.assignee.email).charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Delete button on hover */}
      {isHovered && !isSortableDragging && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-white/90 dark:bg-zinc-800/90 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
          title="Delete card"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
