import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const boards = await boardService.list(userId);

  return NextResponse.json({ boards });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length === 0) {
    return NextResponse.json({ error: "Board name is required" }, { status: 400 });
  }

  if (name.length > 100) {
    return NextResponse.json({ error: "Board name must be 100 characters or less" }, { status: 400 });
  }

  const board = await boardService.create({ name, userId });

  return NextResponse.json(board, { status: 201 });
}
