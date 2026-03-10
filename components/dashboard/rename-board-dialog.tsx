"use client";

import { useState, useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpdateBoard } from "@/hooks/use-board";

type RenameBoardDialogProps = {
  boardId: string | null;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RenameBoardDialog({
  boardId,
  currentName,
  open,
  onOpenChange,
}: RenameBoardDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const updateBoard = useUpdateBoard();

  // Sync name when dialog opens with a new board
  useEffect(() => {
    if (open) {
      setName(currentName);
      setError(null);
    }
  }, [open, currentName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!boardId) return;
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Board name is required");
      return;
    }
    if (trimmed.length > 100) {
      setError("Board name must be 100 characters or less");
      return;
    }
    if (trimmed === currentName) {
      onOpenChange(false);
      return;
    }

    updateBoard.mutate(
      { boardId, name: trimmed },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center">Rename Board</DialogTitle>
          <DialogDescription className="text-center">
            Give your board a new name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="rename-board-name">Board name</Label>
              <Input
                id="rename-board-name"
                placeholder="e.g. Marketing Campaign Q2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={100}
                disabled={updateBoard.isPending}
              />
              <p className="text-xs text-muted-foreground">
                {name.length}/100 characters
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateBoard.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateBoard.isPending}>
              {updateBoard.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {updateBoard.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
