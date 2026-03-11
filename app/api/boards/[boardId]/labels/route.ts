import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { labelService } from "@/services/label.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId } = await params;
  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const labels = await labelService.listByBoard(boardId);
  return NextResponse.json(labels);
}

export async function POST(
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

  let body: { name?: string; color?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.color)
    return NextResponse.json({ error: "color is required" }, { status: 400 });

  const label = await labelService.create(boardId, {
    name: body.name ?? "",
    color: body.color,
  });
  return NextResponse.json(label, { status: 201 });
}
