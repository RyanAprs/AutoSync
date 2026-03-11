"use client";

import { useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { KanbanColumn } from "./column";
import { KanbanCard } from "./card";
import { CardDetailDialog } from "./card-detail-dialog";
import {
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
  useReorderColumns,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  useMoveCard,
  optimisticMoveCard,
  optimisticReorderColumns,
} from "@/hooks/use-kanban";
import type { BoardDetail, CardDetail, ColumnDetail } from "@/types/api";

interface KanbanBoardProps {
  board: BoardDetail;
  boardId: string;
  canEdit: boolean;
}

export function KanbanBoard({ board, boardId, canEdit }: KanbanBoardProps) {
  const qc = useQueryClient();
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const newColInputRef = useRef<HTMLInputElement>(null);

  // Card detail dialog state
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  // Active drag state
  const [activeCard, setActiveCard] = useState<CardDetail | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnDetail | null>(null);

  // Mutations
  const createColumn = useCreateColumn(boardId);
  const updateColumn = useUpdateColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const reorderColumns = useReorderColumns(boardId);
  const createCard = useCreateCard(boardId);
  const updateCard = useUpdateCard(boardId);
  const deleteCard = useDeleteCard(boardId);
  const moveCard = useMoveCard(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const boardKey = ["boards", boardId];

  function setOptimisticBoard(updater: (prev: BoardDetail) => BoardDetail) {
    qc.setQueryData<BoardDetail>(boardKey, (old) => (old ? updater(old) : old));
  }

  // ─── Add column ──────────────────────────────────────────────────────────

  async function handleAddColumn() {
    const trimmed = newColTitle.trim();
    if (!trimmed) return;
    setNewColTitle("");
    setAddingColumn(false);
    await createColumn.mutateAsync(trimmed);
  }

  // ─── Drag handlers ───────────────────────────────────────────────────────

  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === "card") setActiveCard(data.card);
    if (data?.type === "column") setActiveColumn(data.column);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "card") return;

    const activeCardData = activeData.card as CardDetail;
    let targetColumnId: string;
    let targetPosition: number;

    if (overData?.type === "card") {
      const overCard = overData.card as CardDetail;
      if (activeCardData.id === overCard.id) return;
      targetColumnId = overCard.columnId;
      const targetCol = board.columns.find((c) => c.id === targetColumnId);
      targetPosition = targetCol?.cards.findIndex((c) => c.id === overCard.id) ?? 0;
    } else if (overData?.type === "column-drop") {
      targetColumnId = overData.columnId as string;
      const targetCol = board.columns.find((c) => c.id === targetColumnId);
      targetPosition = targetCol?.cards.length ?? 0;
    } else {
      return;
    }

    if (
      activeCardData.columnId === targetColumnId &&
      activeCardData.position === targetPosition
    )
      return;

    setOptimisticBoard((b) =>
      optimisticMoveCard(b, activeCardData.id, targetColumnId, targetPosition)
    );
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // ── Column reorder ──
    if (activeData?.type === "column" && overData?.type === "column") {
      if (active.id === over.id) return;
      const newOrder = board.columns
        .map((c) => c.id)
        .filter((id) => id !== active.id);
      const overIdx = newOrder.indexOf(over.id as string);
      newOrder.splice(overIdx, 0, active.id as string);
      setOptimisticBoard((b) => optimisticReorderColumns(b, newOrder));
      reorderColumns.mutate(newOrder);
      return;
    }

    // ── Card move ──
    if (activeData?.type === "card") {
      const movedCard = activeData.card as CardDetail;
      for (const col of board.columns) {
        const idx = col.cards.findIndex((c) => c.id === movedCard.id);
        if (idx !== -1) {
          moveCard.mutate({
            cardId: movedCard.id,
            columnId: col.id,
            position: idx,
          });
          return;
        }
      }
    }
  }

  const columnIds = board.columns.map((c) => c.id);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-full gap-3 overflow-x-auto overflow-y-hidden p-4 pb-6 items-start">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {board.columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                canEdit={canEdit}
                onDeleteColumn={(colId) => deleteColumn.mutate(colId)}
                onUpdateColumn={(colId, title) => updateColumn.mutate({ columnId: colId, title })}
                onAddCard={(colId, title) => createCard.mutate({ columnId: colId, title })}
                onDeleteCard={(cardId) => deleteCard.mutate(cardId)}
                onUpdateCard={(cardId, title) => updateCard.mutate({ cardId, title })}
                onOpenCardDetail={setOpenCardId}
              />
            ))}
          </SortableContext>

          {/* Add column */}
          {canEdit && (
            <div className="w-[272px] shrink-0">
              {addingColumn ? (
                <div className="rounded-xl bg-white dark:bg-zinc-800 p-3 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col gap-2">
                  <input
                    ref={newColInputRef}
                    autoFocus
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddColumn(); }
                      if (e.key === "Escape") { setNewColTitle(""); setAddingColumn(false); }
                    }}
                    placeholder="Enter list name..."
                    className="rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleAddColumn}
                      disabled={!newColTitle.trim()}
                      className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Add list
                    </button>
                    <button
                      onClick={() => { setNewColTitle(""); setAddingColumn(false); }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingColumn(true); setTimeout(() => newColInputRef.current?.focus(), 0); }}
                  className="flex w-full items-center gap-2 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-zinc-200/40 dark:border-zinc-700/40 hover:border-zinc-300 dark:hover:border-zinc-600 px-3.5 py-2.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add another list
                </button>
              )}
            </div>
          )}

          {/* Right padding spacer for scroll */}
          <div className="w-1 shrink-0" />
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
          {activeCard && (
            <div className="rotate-2 opacity-95">
              <KanbanCard
                card={activeCard}
                isDragging
                onDelete={() => {}}
                onUpdate={() => {}}
                onOpenDetail={() => {}}
              />
            </div>
          )}
          {activeColumn && (
            <KanbanColumn
              column={activeColumn}
              isDragging
              canEdit={false}
              onDeleteColumn={() => {}}
              onUpdateColumn={() => {}}
              onAddCard={() => {}}
              onDeleteCard={() => {}}
              onUpdateCard={() => {}}
              onOpenCardDetail={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Card detail dialog */}
      <CardDetailDialog
        cardId={openCardId}
        boardId={boardId}
        board={board}
        canEdit={canEdit}
        onClose={() => setOpenCardId(null)}
        onDeleteCard={(cardId) => { deleteCard.mutate(cardId); setOpenCardId(null); }}
      />
    </>
  );
}
