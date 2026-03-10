"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/hooks/use-board";
import { BoardCard, BoardCardSkeleton } from "@/components/dashboard/board-card";
import { CreateBoardDialog } from "@/components/dashboard/create-board-dialog";
import { DeleteBoardDialog } from "@/components/dashboard/delete-board-dialog";
import { RenameBoardDialog } from "@/components/dashboard/rename-board-dialog";
import { EmptyBoards } from "@/components/dashboard/empty-boards";

export default function BoardsListPage() {
  const { data: boards, isLoading } = useBoards();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const filteredBoards = useMemo(() => {
    if (!boards) return [];
    if (!search.trim()) return boards;
    const query = search.toLowerCase();
    return boards.filter((b) => b.name.toLowerCase().includes(query));
  }, [boards, search]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-1 h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BoardCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state (no boards at all)
  if (!boards || boards.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Boards
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Organize your projects with kanban boards
          </p>
        </div>
        <EmptyBoards />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Boards
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {boards.length} board{boards.length !== 1 ? "s" : ""} — organize your projects
          </p>
        </div>
        <CreateBoardDialog />
      </div>

      {/* Search */}
      {boards.length > 3 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search boards…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Board grid */}
      {filteredBoards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onDelete={(id) => {
                const b = boards.find((b) => b.id === id);
                setDeleteTarget(b ? { id: b.id, name: b.name } : null);
              }}
              onRename={(id, currentName) => {
                setRenameTarget({ id, name: currentName });
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-12 dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            No boards match &ldquo;{search}&rdquo;
          </p>
        </div>
      )}

      {/* Rename dialog */}
      <RenameBoardDialog
        boardId={renameTarget?.id ?? null}
        currentName={renameTarget?.name ?? ""}
        open={!!renameTarget}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      />

      {/* Delete dialog */}
      <DeleteBoardDialog
        boardId={deleteTarget?.id ?? null}
        boardName={deleteTarget?.name}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
