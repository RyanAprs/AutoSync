"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { boardService } from "@/services/board.service";
import { redirect } from "next/navigation";

export async function createBoard(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const userId = (session.user as { id: string }).id;
  const name = formData.get("name")?.toString().trim();

  if (!name || name.length === 0) {
    return { success: false as const, error: "Board name is required" };
  }

  if (name.length > 100) {
    return { success: false as const, error: "Board name must be 100 characters or less" };
  }

  const board = await boardService.create({ name, userId });
  return { success: true as const, boardId: board.id };
}

export async function deleteBoard(boardId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const userId = (session.user as { id: string }).id;

  const role = await boardService.getMemberRole(boardId, userId);
  if (role !== "owner") {
    return { success: false as const, error: "Only the board owner can delete this board" };
  }

  await boardService.delete(boardId);
  redirect("/boards");
}
