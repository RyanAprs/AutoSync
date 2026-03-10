import { db } from "@/lib/db";

export const boardService = {
  /** List all boards where the user is a member */
  async list(userId: string) {
    const memberships = await db.boardMember.findMany({
      where: { userId },
      include: {
        board: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { board: { updatedAt: "desc" } },
    });

    return memberships.map((m) => ({
      id: m.board.id,
      name: m.board.name,
      createdAt: m.board.createdAt.toISOString(),
      updatedAt: m.board.updatedAt.toISOString(),
      role: m.role,
      memberCount: m.board._count.members,
    }));
  },

  /** Get board by ID with members and columns */
  async getById(boardId: string) {
    const board = await db.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
          orderBy: { invitedAt: "asc" },
        },
        columns: {
          orderBy: { position: "asc" },
          include: { _count: { select: { cards: true } } },
        },
      },
    });

    if (!board) return null;

    return {
      id: board.id,
      name: board.name,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
      members: board.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        user: m.user,
      })),
      columns: board.columns.map((c) => ({
        id: c.id,
        title: c.title,
        position: c.position,
        _count: c._count,
      })),
    };
  },

  /** Create a new board and add creator as owner */
  async create(data: { name: string; userId: string }) {
    const board = await db.board.create({
      data: {
        name: data.name,
        members: {
          create: {
            userId: data.userId,
            role: "owner",
            acceptedAt: new Date(),
          },
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return {
      id: board.id,
      name: board.name,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
      role: "owner" as const,
      memberCount: board._count.members,
    };
  },

  /** Update board name */
  async update(boardId: string, data: { name?: string }) {
    const board = await db.board.update({
      where: { id: boardId },
      data: { name: data.name },
    });

    return {
      id: board.id,
      name: board.name,
      updatedAt: board.updatedAt.toISOString(),
    };
  },

  /** Delete a board */
  async delete(boardId: string) {
    await db.board.delete({ where: { id: boardId } });
  },

  /** Check if user is a member of a board and return their role */
  async getMemberRole(boardId: string, userId: string) {
    const member = await db.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    return member?.role ?? null;
  },
};
