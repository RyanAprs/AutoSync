"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Users,
  Settings,
  UserPlus,
  ShieldOff,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoard } from "@/hooks/use-board";
import { KanbanBoard } from "@/components/kanban/board";
import { InviteMemberDialog } from "@/components/dashboard/invite-member-dialog";

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params);
  const { data: board, isLoading, error } = useBoard(boardId);
  const { data: session } = useSession();
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentUserId = (session?.user as { id?: string })?.id;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-4 px-2 pb-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex flex-1 gap-3 px-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-[272px] shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Access denied or not found
  if (error || !board) {
    const is403 = error?.message?.includes("403") || error?.message?.includes("not found");
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <ShieldOff className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {is403 ? "Access Denied" : "Board not found"}
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          {is403
            ? "You don't have permission to view this board."
            : "This board may have been deleted or you don't have access."}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/boards">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Boards
          </Link>
        </Button>
      </div>
    );
  }

  const currentMember = board.members.find((m) => m.userId === currentUserId);
  const isOwner = currentMember?.role === "owner";

  return (
    <div className="flex h-full flex-col overflow-hidden -m-6">
      {/* Compact board header */}
      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Link href="/boards">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shrink-0">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {board.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{board.columns.length} lists</span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span>{board.columns.reduce((s, c) => s + c._count.cards, 0)} cards</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Member avatars */}
          <div className="hidden sm:flex -space-x-1.5">
            {board.members.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 bg-gradient-to-br from-blue-500 to-purple-500 text-[10px] font-semibold text-white"
                title={m.user.name ?? m.user.email}
              >
                {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
              </div>
            ))}
            {board.members.length > 4 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                +{board.members.length - 4}
              </div>
            )}
          </div>

          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          )}

          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/boards/${boardId}/settings`}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Kanban area — fills remaining space with contained overflow */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/50">
        <KanbanBoard
          board={board}
          boardId={boardId}
          canEdit={currentMember?.role !== "viewer"}
        />
      </div>

      <InviteMemberDialog
        boardId={boardId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}
