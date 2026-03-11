"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Paperclip,
  MessageSquare,
  Tag,
  ArrowRight,
  Copy,
  Trash2,
  X,
  Check,
  Pencil,
  UserCircle2,
  AlignLeft,
  FileIcon,
  LayoutIcon,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LabelPopover, labelColorMap } from "./label-popover";
import { MoveCardPopover } from "./move-card-popover";
import {
  useCardDetail,
  useUpdateCardDetail,
  useAddComment,
  useUpdateComment,
  useDeleteComment,
  useUploadAttachment,
  useDeleteAttachment,
} from "@/hooks/use-card-detail";
import type { BoardDetail, CommentDetail } from "@/types/api";
import { useSession } from "next-auth/react";

interface CardDetailDialogProps {
  cardId: string | null;
  boardId: string;
  board: BoardDetail;
  canEdit: boolean;
  onClose: () => void;
  onDeleteCard: (cardId: string) => void;
}

export function CardDetailDialog({
  cardId,
  boardId,
  board,
  canEdit,
  onClose,
  onDeleteCard,
}: CardDetailDialogProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;

  const { data: card, isLoading } = useCardDetail(boardId, cardId);

  const updateCard = useUpdateCardDetail(boardId, cardId ?? "");
  const addComment = useAddComment(boardId, cardId ?? "");
  const updateComment = useUpdateComment(boardId, cardId ?? "");
  const deleteComment = useDeleteComment(boardId, cardId ?? "");
  const uploadAttachment = useUploadAttachment(boardId, cardId ?? "");
  const deleteAttachment = useDeleteAttachment(boardId, cardId ?? "");

  // ── Title editing ──
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // ── Description editing ──
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");

  // ── Deadline editing ──
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [deadlineValue, setDeadlineValue] = useState("");

  // ── Assignee editing ──
  const [editingAssignee, setEditingAssignee] = useState(false);

  // ── Comment input ──
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (card) {
      setTitleValue(card.title);
      setDescValue(card.description ?? "");
      setDeadlineValue(card.deadline ? card.deadline.slice(0, 10) : "");
    }
  }, [card]);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  if (!cardId) return null;

  async function saveTitle() {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== card?.title) {
      await updateCard.mutateAsync({ title: trimmed });
    }
    setEditingTitle(false);
  }

  async function saveDesc() {
    await updateCard.mutateAsync({ description: descValue.trim() || null });
    setEditingDesc(false);
  }

  async function saveDeadline() {
    await updateCard.mutateAsync({ deadline: deadlineValue || null });
    setEditingDeadline(false);
  }

  async function handleAddComment() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    await addComment.mutateAsync(trimmed);
    setCommentText("");
  }

  async function handleSaveEditComment() {
    if (!editingCommentId) return;
    const trimmed = editingCommentText.trim();
    if (!trimmed) return;
    await updateComment.mutateAsync({ commentId: editingCommentId, content: trimmed });
    setEditingCommentId(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAttachment.mutateAsync(file);
    e.target.value = "";
  }

  const isDeadlineSoon =
    card?.deadline && new Date(card.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isOverdue = card?.deadline && new Date(card.deadline) < new Date();

  return (
    <Dialog open={!!cardId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl h-[88vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700">
        {isLoading || !card ? (
          <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-500" />
              <span className="text-xs text-zinc-400 font-medium">Loading card…</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">

            {/* ══════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════ */}
            <div className="flex flex-1 flex-col overflow-y-auto bg-white dark:bg-zinc-900">

              {/* ── Header strip ── */}
              <div className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800 px-6 py-3 flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400 min-w-0">
                  <LayoutIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    in list <span className="font-semibold text-zinc-600 dark:text-zinc-300">{card.columnTitle}</span>
                  </span>
                </div>
              </div>

              <div className="px-7 py-6 space-y-7">

                {/* ── Label chips ── */}
                {card.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {card.labels.map((label) => {
                      const colors = labelColorMap[label.color] ?? labelColorMap.blue;
                      return (
                        <span
                          key={label.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                            colors.bg, colors.text
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                          {label.name || "Label"}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* ── Title ── */}
                <div>
                  {editingTitle ? (
                    <div className="flex flex-col gap-3">
                      <textarea
                        ref={titleRef}
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveTitle(); }
                          if (e.key === "Escape") { setTitleValue(card.title); setEditingTitle(false); }
                        }}
                        rows={2}
                        className="w-full resize-none rounded-xl border-2 border-blue-400 dark:border-blue-500 bg-white dark:bg-zinc-800 px-4 py-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100 outline-none shadow-sm"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveTitle} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors">
                          <Check className="h-4 w-4" /> Save
                        </button>
                        <button onClick={() => { setTitleValue(card.title); setEditingTitle(false); }} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-600 px-4 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          <X className="h-4 w-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => canEdit && setEditingTitle(true)}
                      className={cn(
                        "w-full text-left text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug",
                        canEdit && "rounded-xl px-2 -mx-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      )}
                    >
                      {card.title}
                    </button>
                  )}
                </div>

                {/* ── Description ── */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                      <AlignLeft className="h-3.5 w-3.5 text-zinc-500" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">Description</h3>
                  </div>
                  {editingDesc ? (
                    <div className="flex flex-col gap-3">
                      <textarea
                        autoFocus
                        value={descValue}
                        onChange={(e) => setDescValue(e.target.value)}
                        rows={6}
                        placeholder="Add a more detailed description…"
                        className="w-full resize-none rounded-xl border-2 border-blue-400 dark:border-blue-500 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 outline-none shadow-sm"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveDesc} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Save</button>
                        <button onClick={() => { setDescValue(card.description ?? ""); setEditingDesc(false); }} className="rounded-lg border border-zinc-200 dark:border-zinc-600 px-4 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => canEdit && setEditingDesc(true)}
                      className={cn(
                        "min-h-[72px] rounded-xl px-4 py-3 text-sm leading-relaxed",
                        card.description
                          ? "text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap"
                          : "text-zinc-400 dark:text-zinc-500 italic",
                        canEdit && "cursor-pointer bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
                      )}
                    >
                      {card.description || "Click to add a description…"}
                    </div>
                  )}
                </section>

                {/* ── Attachments ── */}
                {(card.attachments.length > 0 || canEdit) && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                          <Paperclip className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                          Attachments
                        </h3>
                        {card.attachments.length > 0 && (
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-500">{card.attachments.length}</span>
                        )}
                      </div>
                      {canEdit && (
                        <>
                          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadAttachment.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition-colors disabled:opacity-50"
                          >
                            <Paperclip className="h-3 w-3" />
                            {uploadAttachment.isPending ? "Uploading…" : "Add file"}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      {card.attachments.map((att) => (
                        <div key={att.id} className="group flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-4 py-3 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 shadow-sm">
                            <FileIcon className="h-4 w-4 text-zinc-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {att.name}
                            </a>
                            <p className="mt-0.5 text-[11px] text-zinc-400">
                              {att.sizeBytes ? `${(att.sizeBytes / 1024).toFixed(1)} KB · ` : ""}
                              {new Date(att.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => deleteAttachment.mutate(att.id)}
                              className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Activity / Comments ── */}
                <section className="pb-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                      <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">Activity</h3>
                    {card.comments.length > 0 && (
                      <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-500">{card.comments.length}</span>
                    )}
                  </div>

                  {/* Comment input */}
                  <div className="mb-5 flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white shadow-sm">
                      {(session?.user?.name ?? session?.user?.email ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); }
                        }}
                        placeholder="Write a comment…"
                        rows={commentText ? 3 : 1}
                        className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all placeholder:text-zinc-400"
                      />
                      {commentText.trim() && (
                        <button
                          onClick={handleAddComment}
                          disabled={addComment.isPending}
                          className="mt-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
                        >
                          {addComment.isPending ? "Posting…" : "Post comment"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-4">
                    {card.comments.map((comment: CommentDetail) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-sm">
                          {(comment.user.name ?? comment.user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1.5">
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                              {comment.user.name ?? comment.user.email}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              {new Date(comment.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {editingCommentId === comment.id ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                autoFocus
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-xl border-2 border-blue-400 dark:border-blue-500 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none"
                              />
                              <div className="flex gap-2">
                                <button onClick={handleSaveEditComment} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Save</button>
                                <button onClick={() => setEditingCommentId(null)} className="rounded-lg border border-zinc-200 dark:border-zinc-600 px-4 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="group">
                              <p className="rounded-xl rounded-tl-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                              </p>
                              {comment.user.id === currentUserId && (
                                <div className="mt-1.5 flex gap-3 pl-1">
                                  <button
                                    onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }}
                                    className="text-[11px] font-medium text-zinc-400 hover:text-blue-500 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-[11px] text-zinc-200 dark:text-zinc-700">|</span>
                                  <button
                                    onClick={() => deleteComment.mutate(comment.id)}
                                    className="text-[11px] font-medium text-zinc-400 hover:text-red-500 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </div>

            {/* ══════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════ */}
            <div className="w-60 shrink-0 border-l border-zinc-100 dark:border-zinc-800 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/60">

              {/* Sidebar header */}
              <div className="px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Card Details</p>
              </div>

              <div className="px-5 py-4 space-y-5">

                {/* ── Members ── */}
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Assigned to</p>
                  {card.assignee ? (
                    <div className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 shadow-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
                        {(card.assignee.name ?? card.assignee.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                        {card.assignee.name ?? card.assignee.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 px-3 py-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
                        <UserCircle2 className="h-4 w-4 text-zinc-400" />
                      </div>
                      <span className="text-xs text-zinc-400 italic">Unassigned</span>
                    </div>
                  )}
                  {canEdit && (
                    <div className="mt-2">
                      {editingAssignee ? (
                        <div className="space-y-2">
                          <select
                            defaultValue={card.assignee?.id ?? ""}
                            onChange={async (e) => {
                              await updateCard.mutateAsync({ assigneeId: e.target.value || null });
                              setEditingAssignee(false);
                            }}
                            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-400/50"
                          >
                            <option value="">Unassigned</option>
                            {board.members.map((m) => (
                              <option key={m.userId} value={m.userId}>
                                {m.user.name ?? m.user.email}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => setEditingAssignee(false)} className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingAssignee(true)}
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <UserCircle2 className="h-3.5 w-3.5" />
                          {card.assignee ? "Change member" : "Assign member"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Due date ── */}
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Due Date</p>
                  {editingDeadline ? (
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={deadlineValue}
                        onChange={(e) => setDeadlineValue(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-400/50"
                      />
                      <div className="flex gap-1.5">
                        <button onClick={saveDeadline} className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">Save</button>
                        <button onClick={() => setEditingDeadline(false)} className="rounded-lg border border-zinc-200 dark:border-zinc-600 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">✕</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => canEdit && setEditingDeadline(true)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors shadow-sm",
                        card.deadline
                          ? isOverdue
                            ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                            : isDeadlineSoon
                              ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                          : "border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-400 hover:border-zinc-400",
                        canEdit && "cursor-pointer"
                      )}
                    >
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {card.deadline
                        ? new Date(card.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "Set due date"}
                      {isOverdue && <span className="ml-auto text-[10px] font-bold">OVERDUE</span>}
                      {isDeadlineSoon && !isOverdue && <span className="ml-auto text-[10px] font-bold">SOON</span>}
                    </button>
                  )}
                </div>

                {/* ── Labels ── */}
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Labels</p>
                  {card.labels.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {card.labels.map((label) => {
                        const colors = labelColorMap[label.color] ?? labelColorMap.blue;
                        return (
                          <span key={label.id} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", colors.bg, colors.text)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                            {label.name || "Label"}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <LabelPopover boardId={boardId} cardId={card.id} cardLabels={card.labels} canEdit={canEdit}>
                    <button className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition-colors w-full">
                      <Tag className="h-3.5 w-3.5" />
                      Manage labels
                    </button>
                  </LabelPopover>
                </div>

                {/* ── Actions ── */}
                {canEdit && (
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Actions</p>

                    <MoveCardPopover
                      boardId={boardId}
                      cardId={card.id}
                      currentColumnId={card.columnId}
                      columns={board.columns}
                      onSuccess={onClose}
                      mode="move"
                    >
                      <button className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition-colors">
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                        Move card
                      </button>
                    </MoveCardPopover>

                    <MoveCardPopover
                      boardId={boardId}
                      cardId={card.id}
                      currentColumnId={card.columnId}
                      columns={board.columns}
                      mode="copy"
                    >
                      <button className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition-colors">
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                        Copy card
                      </button>
                    </MoveCardPopover>

                    <button
                      onClick={() => { onDeleteCard(card.id); onClose(); }}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-3 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete card
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
