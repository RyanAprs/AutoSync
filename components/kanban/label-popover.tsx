"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { LabelDetail } from "@/types/api";
import {
  useBoardLabels,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
  useToggleLabel,
} from "@/hooks/use-card-detail";

// Trello-like color palette
const LABEL_COLORS = [
  { value: "green",  bg: "bg-green-500",   ring: "ring-green-600" },
  { value: "yellow", bg: "bg-yellow-400",  ring: "ring-yellow-500" },
  { value: "orange", bg: "bg-orange-500",  ring: "ring-orange-600" },
  { value: "red",    bg: "bg-red-500",     ring: "ring-red-600" },
  { value: "purple", bg: "bg-purple-500",  ring: "ring-purple-600" },
  { value: "blue",   bg: "bg-blue-500",    ring: "ring-blue-600" },
  { value: "sky",    bg: "bg-sky-400",     ring: "ring-sky-500" },
  { value: "lime",   bg: "bg-lime-500",    ring: "ring-lime-600" },
  { value: "pink",   bg: "bg-pink-500",    ring: "ring-pink-600" },
  { value: "black",  bg: "bg-zinc-700",    ring: "ring-zinc-800" },
];

export const labelColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  green:  { bg: "bg-green-100  dark:bg-green-900/40",  text: "text-green-800  dark:text-green-300",  dot: "bg-green-500" },
  yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300", dot: "bg-yellow-400" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300", dot: "bg-orange-500" },
  red:    { bg: "bg-red-100    dark:bg-red-900/40",    text: "text-red-800    dark:text-red-300",    dot: "bg-red-500" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-300", dot: "bg-purple-500" },
  blue:   { bg: "bg-blue-100   dark:bg-blue-900/40",   text: "text-blue-800   dark:text-blue-300",   dot: "bg-blue-500" },
  sky:    { bg: "bg-sky-100    dark:bg-sky-900/40",    text: "text-sky-800    dark:text-sky-300",    dot: "bg-sky-400" },
  lime:   { bg: "bg-lime-100   dark:bg-lime-900/40",   text: "text-lime-800   dark:text-lime-300",   dot: "bg-lime-500" },
  pink:   { bg: "bg-pink-100   dark:bg-pink-900/40",   text: "text-pink-800   dark:text-pink-300",   dot: "bg-pink-500" },
  black:  { bg: "bg-zinc-200   dark:bg-zinc-700",      text: "text-zinc-800   dark:text-zinc-200",   dot: "bg-zinc-700" },
};

interface LabelPopoverProps {
  boardId: string;
  cardId: string;
  cardLabels: LabelDetail[];
  canEdit: boolean;
  children: React.ReactNode;
}

type Mode = "list" | "create" | "edit";

export function LabelPopover({ boardId, cardId, cardLabels, canEdit, children }: LabelPopoverProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("list");
  const [editingLabel, setEditingLabel] = useState<LabelDetail | null>(null);
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(LABEL_COLORS[0].value);

  const { data: boardLabels = [] } = useBoardLabels(boardId);
  const createLabel = useCreateLabel(boardId);
  const updateLabel = useUpdateLabel(boardId);
  const deleteLabel = useDeleteLabel(boardId);
  const toggleLabel = useToggleLabel(boardId, cardId);

  const cardLabelIds = new Set(cardLabels.map((l) => l.id));

  function openCreate() {
    setFormName("");
    setFormColor(LABEL_COLORS[0].value);
    setMode("create");
  }

  function openEdit(label: LabelDetail) {
    setEditingLabel(label);
    setFormName(label.name);
    setFormColor(label.color);
    setMode("edit");
  }

  async function handleSave() {
    if (mode === "create") {
      await createLabel.mutateAsync({ name: formName, color: formColor });
    } else if (mode === "edit" && editingLabel) {
      await updateLabel.mutateAsync({ labelId: editingLabel.id, name: formName, color: formColor });
    }
    setMode("list");
  }

  async function handleDelete() {
    if (!editingLabel) return;
    await deleteLabel.mutateAsync(editingLabel.id);
    setMode("list");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        {mode === "list" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Labels</p>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {boardLabels.length === 0 && (
              <p className="text-xs text-zinc-400 py-1">No labels yet. Create one below.</p>
            )}

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {boardLabels.map((label) => {
                const colors = labelColorMap[label.color] ?? labelColorMap.blue;
                const isActive = cardLabelIds.has(label.id);
                return (
                  <div key={label.id} className="flex items-center gap-2">
                    <button
                      onClick={() => canEdit && toggleLabel.mutate(label.id)}
                      disabled={!canEdit}
                      className={cn(
                        "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                        colors.bg,
                        colors.text,
                        canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"
                      )}
                    >
                      <div className={cn("h-2.5 w-2.5 rounded-full", colors.dot)} />
                      <span className="flex-1 text-left">{label.name || <em className="opacity-50">Unnamed</em>}</span>
                      {isActive && <Check className="h-3 w-3 shrink-0" />}
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => openEdit(label)}
                        className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {canEdit && (
              <button
                onClick={openCreate}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-100 dark:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create label
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode("list")}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {mode === "create" ? "Create label" : "Edit label"}
              </p>
            </div>

            {/* Color picker */}
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Color</p>
              <div className="grid grid-cols-5 gap-1.5">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setFormColor(c.value)}
                    className={cn(
                      "h-7 rounded-md transition-all",
                      c.bg,
                      formColor === c.value ? `ring-2 ring-offset-1 ${c.ring} scale-110` : "hover:opacity-80"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Name input */}
            <div>
              <p className="mb-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Name</p>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder="Label name (optional)"
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/60"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={createLabel.isPending || updateLabel.isPending}
                className="flex-1 rounded-md bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {mode === "create" ? "Create" : "Save"}
              </button>
              {mode === "edit" && (
                <button
                  onClick={handleDelete}
                  disabled={deleteLabel.isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
