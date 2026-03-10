import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const userId = (session.user as { id: string; name?: string | null; email: string }).id;
  const userName = (session.user as { name?: string | null }).name ?? null;
  const userEmail = (session.user as { email: string }).email;

  // Only owner can invite
  const role = await boardService.getMemberRole(boardId, userId);
  if (!role) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  if (role !== "owner") {
    return NextResponse.json({ error: "Only the board owner can invite members" }, { status: 403 });
  }

  let body: { email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const inviteRole =
    body.role === "viewer" ? "viewer" : "editor";

  try {
    const member = await boardService.inviteMember(
      boardId,
      { id: userId, name: userName, email: userEmail },
      email,
      inviteRole
    );
    return NextResponse.json(member, { status: 201 });
  } catch (err: unknown) {
    const e = err as { message: string; code?: string };
    const statusMap: Record<string, number> = {
      USER_NOT_FOUND: 404,
      SELF_INVITE: 400,
      ALREADY_MEMBER: 409,
    };
    const status = e.code ? (statusMap[e.code] ?? 400) : 400;
    return NextResponse.json({ error: e.message, code: e.code }, { status });
  }
}
