"use client";

import { useState } from "react";
import { ArrowRight, Copy, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCopyCard, useMoveCardDetail } from "@/hooks/use-card-detail";
import type { ColumnDetail } from "@/types/api";

interface MoveCardPopoverProps {
  boardId: string;
  cardId: string;
  currentColumnId: string;
  columns: ColumnDetail[];
  onSuccess?: () => void;
  children: React.ReactNode;
  mode?: "move" | "copy";
}

export function MoveCardPopover({
  boardId,
  cardId,
  currentColumnId,
  columns,
  onSuccess,
  children,
  mode = "move",
}: MoveCardPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(currentColumnId);
  const [selectedPosition, setSelectedPosition] = useState(0);

  const moveCard = useMoveCardDetail(boardId);
  const copyCard = useCopyCard(boardId);

  const selectedColumn = columns.find((c) => c.id === selectedColumnId);
  const maxPosition = selectedColumn ? selectedColumn.cards.length : 0;

  async function handleAction() {
    if (mode === "move") {
      await moveCard.mutateAsync({ cardId, columnId: selectedColumnId, position: selectedPosition });
    } else {
      await copyCard.mutateAsync({ cardId, columnId: selectedColumnId });
    }
    setOpen(false);
    onSuccess?.();
  }

  const isPending = moveCard.isPending || copyCard.isPending;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {mode === "move" ? "Move card" : "Copy card"}
            </p>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List selector */}
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              List
            </label>
            <select
              value={selectedColumnId}
              onChange={(e) => {
                setSelectedColumnId(e.target.value);
                setSelectedPosition(0);
              }}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/60"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}{col.id === currentColumnId ? " (current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Position selector (only for move) */}
          {mode === "move" && (
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Position
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(Number(e.target.value))}
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/60"
              >
                {Array.from({ length: maxPosition + 1 }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleAction}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {mode === "move" ? (
              <><ArrowRight className="h-3.5 w-3.5" /> Move</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy</>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
