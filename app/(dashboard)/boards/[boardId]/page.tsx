"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Users,
  Settings,
  Clock,
  Columns3,
  Loader2,
  UserPlus,
  ShieldOff,
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-72 rounded-lg" />
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
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <ShieldOff className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {is403 ? "Access Denied" : "Board not found"}
        </h2>
        <p className="mb-4 text-zinc-500 dark:text-zinc-400">
          {is403
            ? "You don't have permission to view this board."
            : "This board may have been deleted or you don't have access."}
        </p>
        <Button asChild variant="outline">
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
  const totalCards = board.columns.reduce((sum, c) => sum + c._count.cards, 0);

  return (
    <div className="space-y-6">
      {/* Board header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon" className="mt-0.5 shrink-0">
            <Link href="/boards">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to boards</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {board.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {board.members.length} member{board.members.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Columns3 className="h-3.5 w-3.5" />
                {board.columns.length} column{board.columns.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {totalCards} card{totalCards !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Member avatars */}
          <div className="flex -space-x-2">
            {board.members.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-medium text-white dark:border-zinc-900"
                title={m.user.name ?? m.user.email}
              >
                {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
              </div>
            ))}
            {board.members.length > 4 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-xs font-medium text-zinc-600 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-300">
                +{board.members.length - 4}
              </div>
            )}
          </div>

          {/* Invite button — owner only */}
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          )}

          <Button asChild variant="outline" size="sm">
            <Link href={`/boards/${boardId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Kanban area */}
      <div className="min-h-[400px] rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        {board.columns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Columns3 className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              No columns yet
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Add your first column to start managing tasks.
            </p>
          </div>
        ) : (
          <KanbanBoard />
        )}
      </div>

      <InviteMemberDialog
        boardId={boardId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}
