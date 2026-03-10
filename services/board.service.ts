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

  /** List all members of a board */
  async listMembers(boardId: string) {
    const members = await db.boardMember.findMany({
      where: { boardId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { invitedAt: "asc" },
    });
    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      invitedAt: m.invitedAt.toISOString(),
      user: m.user,
    }));
  },

  /** Invite a user by email to a board */
  async inviteMember(
    boardId: string,
    invitedByUser: { id: string; name: string | null | undefined; email: string },
    email: string,
    role: "editor" | "viewer"
  ) {
    // Find the user to invite
    const targetUser = await db.user.findUnique({ where: { email } });
    if (!targetUser) {
      throw Object.assign(new Error("User with this email was not found"), { code: "USER_NOT_FOUND" });
    }

    // Can't invite yourself
    if (targetUser.id === invitedByUser.id) {
      throw Object.assign(new Error("You cannot invite yourself"), { code: "SELF_INVITE" });
    }

    // Check if already a member
    const existing = await db.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: targetUser.id } },
    });
    if (existing) {
      throw Object.assign(new Error("This user is already a member of this board"), { code: "ALREADY_MEMBER" });
    }

    // Get board name for notification
    const board = await db.board.findUnique({ where: { id: boardId }, select: { name: true } });

    // Create member
    const member = await db.boardMember.create({
      data: { boardId, userId: targetUser.id, role, acceptedAt: new Date() },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    // Send notification to invited user
    await db.notification.create({
      data: {
        userId: targetUser.id,
        type: "board_invite",
        title: "You've been invited to a board",
        message: `${invitedByUser.name ?? invitedByUser.email} invited you to "${board?.name ?? "a board"}" as ${role}.`,
        link: `/boards/${boardId}`,
      },
    });

    return {
      id: member.id,
      userId: member.userId,
      role: member.role,
      invitedAt: member.invitedAt.toISOString(),
      user: member.user,
    };
  },

  /** Remove a member from a board */
  async removeMember(boardId: string, targetUserId: string, requestingUserId: string) {
    // Can't remove yourself
    if (targetUserId === requestingUserId) {
      throw Object.assign(new Error("You cannot remove yourself from the board"), { code: "SELF_REMOVE" });
    }

    // Can't remove the owner
    const targetMember = await db.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: targetUserId } },
    });
    if (!targetMember) {
      throw Object.assign(new Error("Member not found"), { code: "NOT_FOUND" });
    }
    if (targetMember.role === "owner") {
      throw Object.assign(new Error("Cannot remove the board owner"), { code: "CANNOT_REMOVE_OWNER" });
    }

    await db.boardMember.delete({
      where: { boardId_userId: { boardId, userId: targetUserId } },
    });
  },
};
