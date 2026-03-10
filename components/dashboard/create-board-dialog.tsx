"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateBoard } from "@/hooks/use-board";

export function CreateBoardDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createBoard = useCreateBoard();

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setName("");
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

    createBoard.mutate(trimmed, {
      onSuccess: () => {
        handleOpen(false);
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Board
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Give your board a name to get started. You can change it later.
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
              <Label htmlFor="board-name">Board name</Label>
              <Input
                id="board-name"
                placeholder="e.g. Marketing Campaign Q2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={100}
                disabled={createBoard.isPending}
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
              onClick={() => handleOpen(false)}
              disabled={createBoard.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBoard.isPending}>
              {createBoard.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createBoard.isPending ? "Creating…" : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
