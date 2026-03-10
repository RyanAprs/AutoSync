"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Settings,
  Loader2,
  Pencil,
  Trash2,
  Users,
  ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBoard, useDeleteBoard } from "@/hooks/use-board";
import { RenameBoardDialog } from "@/components/dashboard/rename-board-dialog";
import { BoardMembersList } from "@/components/dashboard/board-members-list";
import { InviteMemberDialog } from "@/components/dashboard/invite-member-dialog";

export default function BoardSettingsPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = use(params);
  const { data: board, isLoading } = useBoard(boardId);
  const { data: session } = useSession();
  const router = useRouter();
  const deleteBoard = useDeleteBoard();

  const [renameOpen, setRenameOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const currentUserId = (session?.user as { id?: string })?.id;
  const currentMember = board?.members.find((m) => m.userId === currentUserId);
  const isOwner = currentMember?.role === "owner";

  function handleDelete() {
    deleteBoard.mutate(boardId, {
      onSuccess: () => {
        router.push("/boards");
      },
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <ShieldOff className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Board not found</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          This board may have been deleted or you don't have access.
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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href={`/boards/${boardId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to board</span>
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Board Settings
          </h1>
          <p className="text-sm text-muted-foreground">{board.name}</p>
        </div>
      </div>

      {/* General section */}
      {isOwner && (
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold">General</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Manage basic board information.
          </p>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Board name</p>
              <p className="text-sm text-muted-foreground">{board.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRenameOpen(true)}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Rename
            </Button>
          </div>
        </section>
      )}

      {/* Members section */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4 text-muted-foreground" />
              Members
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({board.members.length})
              </span>
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              People who have access to this board.
            </p>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteOpen(true)}
            >
              Invite member
            </Button>
          )}
        </div>

        <BoardMembersList
          boardId={boardId}
          members={board.members}
          currentUserId={currentUserId ?? ""}
          isOwner={isOwner}
        />
      </section>

      {/* Danger zone — owner only */}
      {isOwner && (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="mb-1 text-base font-semibold text-destructive">
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            These actions are permanent and cannot be undone.
          </p>
          <Separator className="mb-4 opacity-30" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete this board</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete this board, all its columns, and cards.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete Board
            </Button>
          </div>
        </section>
      )}

      {/* Dialogs */}
      <RenameBoardDialog
        boardId={boardId}
        currentName={board.name}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />

      <InviteMemberDialog
        boardId={boardId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete board?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>&quot;{board.name}&quot;</strong> along with all its
              columns and cards. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBoard.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBoard.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBoard.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
