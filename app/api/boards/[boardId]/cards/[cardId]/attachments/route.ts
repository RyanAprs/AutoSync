import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { attachmentService } from "@/services/attachment.service";

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

  const attachments = await attachmentService.list(cardId);
  return NextResponse.json(attachments);
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
  if (!role || role === "viewer")
    return NextResponse.json({ error: "No permission" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file)
    return NextResponse.json({ error: "file is required" }, { status: 400 });

  const attachment = await attachmentService.create(cardId, file);
  return NextResponse.json(attachment, { status: 201 });
}
