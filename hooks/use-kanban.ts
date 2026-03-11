"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CardDetail, ColumnDetail, BoardDetail } from "@/types/api";

const BOARDS_KEY = ["boards"] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function boardKey(boardId: string) {
  return [...BOARDS_KEY, boardId];
}

// ─── Column mutations ───────────────────────────────────────────────────────

export function useCreateColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/boards/${boardId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create column");
      return res.json() as Promise<ColumnDetail>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useUpdateColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ columnId, title }: { columnId: string; title: string }) => {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update column");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useDeleteColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (columnId: string) => {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete column");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useReorderColumns(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (columnIds: string[]) => {
      const res = await fetch(`/api/boards/${boardId}/columns/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder columns");
    },
    // Optimistic update is handled in the board component
    onError: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

// ─── Card mutations ─────────────────────────────────────────────────────────

export function useCreateCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      columnId,
      title,
      description,
    }: {
      columnId: string;
      title: string;
      description?: string;
    }) => {
      const res = await fetch(`/api/boards/${boardId}/columns/${columnId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Failed to create card");
      return res.json() as Promise<CardDetail>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useUpdateCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cardId,
      ...data
    }: {
      cardId: string;
      title?: string;
      description?: string | null;
    }) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update card");
      return res.json() as Promise<CardDetail>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useDeleteCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cardId: string) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete card");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useMoveCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cardId,
      columnId,
      position,
    }: {
      cardId: string;
      columnId: string;
      position: number;
    }) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, position }),
      });
      if (!res.ok) throw new Error("Failed to move card");
    },
    // Don't invalidate on success — optimistic update already applied in board
    onError: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

// ─── Optimistic helpers (used by KanbanBoard component) ─────────────────────

export function optimisticMoveCard(
  board: BoardDetail,
  cardId: string,
  targetColumnId: string,
  targetPosition: number
): BoardDetail {
  const columns = board.columns.map((col) => ({
    ...col,
    cards: [...col.cards],
  }));

  // Find and remove card from source
  let movedCard: CardDetail | null = null;
  for (const col of columns) {
    const idx = col.cards.findIndex((c) => c.id === cardId);
    if (idx !== -1) {
      movedCard = { ...col.cards[idx] };
      col.cards.splice(idx, 1);
      // Re-index positions
      col.cards.forEach((c, i) => (c.position = i));
      col._count = { cards: col.cards.length };
      break;
    }
  }

  if (!movedCard) return board;

  // Insert into target
  movedCard.columnId = targetColumnId;
  movedCard.position = targetPosition;
  const targetCol = columns.find((c) => c.id === targetColumnId);
  if (targetCol) {
    targetCol.cards.splice(targetPosition, 0, movedCard);
    targetCol.cards.forEach((c, i) => (c.position = i));
    targetCol._count = { cards: targetCol.cards.length };
  }

  return { ...board, columns };
}

export function optimisticReorderColumns(
  board: BoardDetail,
  columnIds: string[]
): BoardDetail {
  const columnMap = new Map(board.columns.map((c) => [c.id, c]));
  const reordered = columnIds
    .map((id, i) => {
      const col = columnMap.get(id);
      if (!col) return null;
      return { ...col, position: i };
    })
    .filter(Boolean) as BoardDetail["columns"];

  return { ...board, columns: reordered };
}
