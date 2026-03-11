"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CardFullDetail, LabelDetail } from "@/types/api";

// ─── Query keys ─────────────────────────────────────────────────────────────

export function cardDetailKey(cardId: string) {
  return ["card-detail", cardId] as const;
}

export function boardLabelsKey(boardId: string) {
  return ["board-labels", boardId] as const;
}

// ─── Card detail ─────────────────────────────────────────────────────────────

export function useCardDetail(boardId: string, cardId: string | null) {
  return useQuery({
    queryKey: cardDetailKey(cardId ?? ""),
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}/detail`);
      if (!res.ok) throw new Error("Failed to fetch card detail");
      return res.json() as Promise<CardFullDetail>;
    },
    enabled: !!cardId,
  });
}

// ─── Board labels ────────────────────────────────────────────────────────────

export function useBoardLabels(boardId: string) {
  return useQuery({
    queryKey: boardLabelsKey(boardId),
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}/labels`);
      if (!res.ok) throw new Error("Failed to fetch labels");
      return res.json() as Promise<LabelDetail[]>;
    },
    enabled: !!boardId,
  });
}

export function useCreateLabel(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const res = await fetch(`/api/boards/${boardId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create label");
      return res.json() as Promise<LabelDetail>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardLabelsKey(boardId) }),
  });
}

export function useUpdateLabel(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ labelId, ...data }: { labelId: string; name?: string; color?: string }) => {
      const res = await fetch(`/api/boards/${boardId}/labels/${labelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update label");
      return res.json() as Promise<LabelDetail>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardLabelsKey(boardId) }),
  });
}

export function useDeleteLabel(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (labelId: string) => {
      const res = await fetch(`/api/boards/${boardId}/labels/${labelId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete label");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: boardLabelsKey(boardId) }),
  });
}

export function useToggleLabel(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (labelId: string) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      });
      if (!res.ok) throw new Error("Failed to toggle label");
      return res.json() as Promise<{ action: "added" | "removed" }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cardDetailKey(cardId) });
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useAddComment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: cardDetailKey(cardId) }),
  });
}

export function useUpdateComment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const res = await fetch(
        `/api/boards/${boardId}/cards/${cardId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) throw new Error("Failed to update comment");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: cardDetailKey(cardId) }),
  });
}

export function useDeleteComment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(
        `/api/boards/${boardId}/cards/${cardId}/comments/${commentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: cardDetailKey(cardId) }),
  });
}

// ─── Attachments ─────────────────────────────────────────────────────────────

export function useUploadAttachment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}/attachments`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Failed to upload attachment");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: cardDetailKey(cardId) }),
  });
}

export function useDeleteAttachment(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await fetch(
        `/api/boards/${boardId}/cards/${cardId}/attachments/${attachmentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete attachment");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: cardDetailKey(cardId) }),
  });
}

// ─── Update card (detail dialog) ─────────────────────────────────────────────

export function useUpdateCardDetail(boardId: string, cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title?: string;
      description?: string | null;
      deadline?: string | null;
      assigneeId?: string | null;
    }) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update card");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cardDetailKey(cardId) });
      qc.invalidateQueries({ queryKey: ["boards", boardId] });
    },
  });
}

// ─── Copy & Move card ────────────────────────────────────────────────────────

export function useCopyCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, columnId }: { cardId: string; columnId: string }) => {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId }),
      });
      if (!res.ok) throw new Error("Failed to copy card");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}

export function useMoveCardDetail(boardId: string) {
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards", boardId] }),
  });
}
