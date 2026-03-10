import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const userId = (session.user as { id: string }).id;

  // Check membership
  const role = await boardService.getMemberRole(boardId, userId);
  if (!role) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const board = await boardService.getById(boardId);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  return NextResponse.json(board);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const userId = (session.user as { id: string }).id;

  // Only owner can update
  const role = await boardService.getMemberRole(boardId, userId);
  if (role !== "owner") {
    return NextResponse.json({ error: "Only the board owner can update this board" }, { status: 403 });
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (name !== undefined && (name.length === 0 || name.length > 100)) {
    return NextResponse.json({ error: "Board name must be 1-100 characters" }, { status: 400 });
  }

  const updated = await boardService.update(boardId, { name });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const userId = (session.user as { id: string }).id;

  // Only owner can delete
  const role = await boardService.getMemberRole(boardId, userId);
  if (role !== "owner") {
    return NextResponse.json({ error: "Only the board owner can delete this board" }, { status: 403 });
  }

  await boardService.delete(boardId);
  return new NextResponse(null, { status: 204 });
}
