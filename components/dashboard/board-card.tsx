"use client";

import Link from "next/link";
import { LayoutGrid, Users, Clock, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import type { BoardListItem } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 30) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  owner: "default",
  editor: "secondary",
  viewer: "outline",
};

const roleLabel: Record<string, string> = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Viewer",
};

type BoardCardProps = {
  board: BoardListItem;
  onDelete?: (boardId: string) => void;
  onRename?: (boardId: string, currentName: string) => void;
};

export function BoardCard({ board, onDelete, onRename }: BoardCardProps) {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 dark:from-blue-400/30 dark:via-purple-400/30 dark:to-pink-400/30" />
      <div className="relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-zinc-800/50">
        {/* Color bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <Link href={`/boards/${board.id}`} className="flex flex-1 flex-col p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20">
                <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {board.name}
                </h3>
                <Badge variant={roleBadgeVariant[board.role]} className="mt-1 text-xs">
                  {roleLabel[board.role]}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {board.memberCount} {board.memberCount === 1 ? "member" : "members"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(board.updatedAt)}
            </span>
          </div>
        </Link>

        {/* Actions menu — only for owners */}
        {board.role === "owner" && (
          <div className="absolute right-3 top-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Board actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    onRename?.(board.id, board.name);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete?.(board.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex flex-col p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}
