"use client";

import { LayoutGrid } from "lucide-react";
import { CreateBoardDialog } from "./create-board-dialog";

export function EmptyBoards() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-16 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-pink-400/20">
        <LayoutGrid className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        No boards yet
      </h3>
      <p className="mb-6 max-w-sm text-center text-zinc-500 dark:text-zinc-400">
        Create your first board to start organizing your projects and design tasks with kanban columns.
      </p>
      <CreateBoardDialog />
    </div>
  );
}
