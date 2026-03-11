import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { commentService } from "@/services/comment.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, cardId } = await params;
  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comments = await commentService.list(cardId);
  return NextResponse.json(comments);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, cardId } = await params;
  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.content?.trim())
    return NextResponse.json({ error: "content is required" }, { status: 400 });

  const comment = await commentService.create(cardId, userId, body.content.trim());
  return NextResponse.json(comment, { status: 201 });
}
