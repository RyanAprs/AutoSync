import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { cardService } from "@/services/card.service";

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

  const detail = await cardService.getDetail(cardId);
  return NextResponse.json(detail);
}
