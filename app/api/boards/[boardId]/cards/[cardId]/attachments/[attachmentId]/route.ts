import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { attachmentService } from "@/services/attachment.service";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; cardId: string; attachmentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, attachmentId } = await params;
  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (!role || role === "viewer")
    return NextResponse.json({ error: "No permission" }, { status: 403 });

  await attachmentService.delete(attachmentId);
  return new NextResponse(null, { status: 204 });
}
