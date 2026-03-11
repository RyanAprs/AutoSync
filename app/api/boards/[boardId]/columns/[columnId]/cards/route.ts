import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { cardService } from "@/services/card.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, columnId } = await params;
  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role || role === "viewer")
    return NextResponse.json({ error: "No permission" }, { status: 403 });

  let body: { title?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title)
    return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const card = await cardService.create(columnId, {
    title,
    description: body.description,
  });
  return NextResponse.json(card, { status: 201 });
}
