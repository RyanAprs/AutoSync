"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, X, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./card";
import type { CardDetail, ColumnDetail } from "@/types/api";

interface KanbanColumnProps {
  column: ColumnDetail;
  isDragging?: boolean;
  canEdit: boolean;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (cardId: string) => void;
  onUpdateCard: (cardId: string, title: string) => void;
  onOpenCardDetail: (cardId: string) => void;
}

export function KanbanColumn({
  column,
  isDragging = false,
  canEdit,
  onDeleteColumn,
  onUpdateColumn,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onOpenCardDetail,
}: KanbanColumnProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const addCardRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column },
  });

  // Also make the column body droppable for cards
  const { setNodeRef: setDropRef } = useDroppable({
    id: `col-drop-${column.id}`,
    data: { type: "column-drop", columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (addingCard) addCardRef.current?.focus();
  }, [addingCard]);

  function handleSaveTitle() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== column.title) {
      onUpdateColumn(column.id, trimmed);
    } else {
      setTitle(column.title);
    }
    setEditingTitle(false);
  }

  function handleAddCard() {
    const trimmed = newCardTitle.trim();
    if (trimmed) {
      onAddCard(column.id, trimmed);
      setNewCardTitle("");
      addCardRef.current?.focus();
    }
  }

  function handleCancelAdd() {
    setNewCardTitle("");
    setAddingCard(false);
  }

  const cardIds = column.cards.map((c) => c.id);

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        "flex w-[272px] shrink-0 flex-col rounded-xl max-h-full",
        "bg-white/70 dark:bg-zinc-800/70 backdrop-blur-sm",
        "border border-zinc-200/50 dark:border-zinc-700/40",
        "shadow-sm",
        isSortableDragging || isDragging ? "opacity-50 shadow-lg" : ""
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-700/40">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-md p-1 text-zinc-300 dark:text-zinc-600 hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:cursor-grabbing focus:outline-none transition-colors"
          aria-label="Drag column"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        {/* Title */}
        {editingTitle ? (
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleSaveTitle(); }
              if (e.key === "Escape") { setTitle(column.title); setEditingTitle(false); }
            }}
            className="flex-1 rounded-md bg-white dark:bg-zinc-700 px-2 py-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none ring-2 ring-blue-500/50"
          />
        ) : (
          <button
            onClick={() => canEdit && setEditingTitle(true)}
            className={cn(
              "flex-1 rounded-md px-1.5 py-0.5 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate",
              canEdit && "hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
            )}
          >
            {column.title}
          </button>
        )}

        <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-700 px-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums">
          {column.cards.length}
        </span>

        {canEdit && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg py-1">
                  <button
                    onClick={() => { onDeleteColumn(column.id); setShowMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete list
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Card list */}
      <div
        ref={setDropRef}
        className="flex flex-col gap-1.5 overflow-y-auto px-2 py-2 flex-1"
        style={{ minHeight: "4px" }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onUpdate={onUpdateCard}
              onOpenDetail={onOpenCardDetail}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      {canEdit && (
        <div className="px-2 pb-2">
          {addingCard ? (
            <div className="flex flex-col gap-1.5 rounded-lg bg-white dark:bg-zinc-700 p-2 shadow-sm border border-zinc-200/60 dark:border-zinc-600/60">
              <textarea
                ref={addCardRef}
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
                  if (e.key === "Escape") handleCancelAdd();
                }}
                placeholder="Enter card title..."
                rows={2}
                className="w-full resize-none text-sm text-zinc-900 dark:text-zinc-100 bg-transparent outline-none placeholder:text-zinc-400"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddCard}
                  disabled={!newCardTitle.trim()}
                  className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add card
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingCard(true)}
              className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add a card
            </button>
          )}
        </div>
      )}
    </div>
  );
}
