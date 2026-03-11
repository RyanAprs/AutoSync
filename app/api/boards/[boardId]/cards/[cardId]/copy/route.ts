import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { cardService } from "@/services/card.service";

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
  if (!role || role === "viewer")
    return NextResponse.json({ error: "No permission" }, { status: 403 });

  let body: { columnId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.columnId)
    return NextResponse.json({ error: "columnId is required" }, { status: 400 });

  const newCard = await cardService.copy(cardId, body.columnId);
  return NextResponse.json(newCard, { status: 201 });
}
