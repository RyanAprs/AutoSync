"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BoardListItem, BoardDetail } from "@/types/api";

const BOARDS_KEY = ["boards"] as const;

// ─── Fetch helpers ──────────────────────────────────────────────────────────

async function fetchBoards(): Promise<BoardListItem[]> {
  const res = await fetch("/api/boards");
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch boards");
  }
  const data = await res.json();
  return data.boards;
}

async function fetchBoard(boardId: string): Promise<BoardDetail> {
  const res = await fetch(`/api/boards/${boardId}`);
  if (!res.ok) throw new Error("Failed to fetch board");
  return res.json();
}

async function createBoardApi(name: string): Promise<BoardListItem> {
  const res = await fetch("/api/boards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create board" }));
    throw new Error(err.error ?? "Failed to create board");
  }
  return res.json();
}

async function deleteBoardApi(boardId: string): Promise<void> {
  const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete board" }));
    throw new Error(err.error ?? "Failed to delete board");
  }
}

async function updateBoardApi({ boardId, name }: { boardId: string; name: string }): Promise<void> {
  const res = await fetch(`/api/boards/${boardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update board" }));
    throw new Error(err.error ?? "Failed to update board");
  }
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useBoards() {
  return useQuery({
    queryKey: BOARDS_KEY,
    queryFn: fetchBoards,
  });
}

export function useBoard(boardId: string | null) {
  return useQuery({
    queryKey: [...BOARDS_KEY, boardId],
    queryFn: () => fetchBoard(boardId!),
    enabled: !!boardId,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoardApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARDS_KEY });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBoardApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARDS_KEY });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBoardApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOARDS_KEY });
    },
  });
}
