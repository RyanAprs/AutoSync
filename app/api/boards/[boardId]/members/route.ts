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

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const members = await boardService.listMembers(boardId);
  return NextResponse.json({ members });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const requestingUserId = (session.user as { id: string }).id;

  // Only owner can remove members
  const role = await boardService.getMemberRole(boardId, requestingUserId);
  if (!role) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  if (role !== "owner") {
    return NextResponse.json({ error: "Only the board owner can remove members" }, { status: 403 });
  }

  let body: { userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetUserId = body.userId?.trim();
  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    await boardService.removeMember(boardId, targetUserId, requestingUserId);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const e = err as { message: string; code?: string };
    const statusMap: Record<string, number> = {
      SELF_REMOVE: 400,
      NOT_FOUND: 404,
      CANNOT_REMOVE_OWNER: 400,
    };
    const status = e.code ? (statusMap[e.code] ?? 400) : 400;
    return NextResponse.json({ error: e.message, code: e.code }, { status });
  }
}
