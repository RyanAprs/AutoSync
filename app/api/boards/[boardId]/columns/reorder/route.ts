import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { columnService } from "@/services/column.service";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;
  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role || role === "viewer")
    return NextResponse.json({ error: "No permission" }, { status: 403 });

  let body: { columnIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.columnIds) || body.columnIds.length === 0)
    return NextResponse.json({ error: "columnIds array is required" }, { status: 400 });

  await columnService.reorder(boardId, body.columnIds);
  return NextResponse.json({ success: true });
}
