import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { commentService } from "@/services/comment.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string; commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, commentId } = await params;
  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only comment owner can edit
  const ownerId = await commentService.getOwnerId(commentId);
  if (ownerId !== userId)
    return NextResponse.json({ error: "No permission" }, { status: 403 });

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.content?.trim())
    return NextResponse.json({ error: "content is required" }, { status: 400 });

  const updated = await commentService.update(commentId, body.content.trim());
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string; commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, commentId } = await params;
  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Owner or board owner/editor can delete
  const ownerId = await commentService.getOwnerId(commentId);
  if (ownerId !== userId && role === "viewer")
    return NextResponse.json({ error: "No permission" }, { status: 403 });

  await commentService.delete(commentId);
  return new NextResponse(null, { status: 204 });
}
