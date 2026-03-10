"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteBoard } from "@/hooks/use-board";

type DeleteBoardDialogProps = {
  boardId: string | null;
  boardName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteBoardDialog({
  boardId,
  boardName,
  open,
  onOpenChange,
}: DeleteBoardDialogProps) {
  const deleteBoard = useDeleteBoard();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!boardId) return;
    setError(null);

    deleteBoard.mutate(boardId, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-center">Delete Board</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{boardName ?? "this board"}</span>?
            All columns, cards, and submissions inside this board will be permanently removed.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <DialogFooter className="mt-2 sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteBoard.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteBoard.isPending}
          >
            {deleteBoard.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {deleteBoard.isPending ? "Deleting…" : "Delete Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
