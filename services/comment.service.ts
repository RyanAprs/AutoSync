import { db } from "@/lib/db";

export const commentService = {
  /** List comments for a card with user info */
  async list(cardId: string) {
    const comments = await db.cardComment.findMany({
      where: { cardId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    }));
  },

  /** Create a comment */
  async create(cardId: string, userId: string, content: string) {
    const comment = await db.cardComment.create({
      data: { cardId, userId, content },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: comment.user,
    };
  },

  /** Update a comment */
  async update(commentId: string, content: string) {
    const comment = await db.cardComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: comment.user,
    };
  },

  /** Delete a comment */
  async delete(commentId: string) {
    await db.cardComment.delete({ where: { id: commentId } });
  },

  /** Get the userId who owns a comment (for permission check) */
  async getOwnerId(commentId: string) {
    const c = await db.cardComment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });
    return c?.userId ?? null;
  },
};
