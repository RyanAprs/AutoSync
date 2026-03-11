import { db } from "@/lib/db";

export const cardService = {
  /** Create a card at the bottom of a column */
  async create(columnId: string, data: { title: string; description?: string }) {
    const maxPos = await db.card.aggregate({
      where: { columnId },
      _max: { position: true },
    });
    const position = (maxPos._max.position ?? -1) + 1;

    const card = await db.card.create({
      data: {
        columnId,
        title: data.title,
        description: data.description,
        position,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return {
      id: card.id,
      columnId: card.columnId,
      title: card.title,
      description: card.description,
      position: card.position,
      deadline: card.deadline?.toISOString() ?? null,
      assignee: card.assignee,
    };
  },

  /** Update card fields */
  async update(
    id: string,
    data: { title?: string; description?: string | null; deadline?: string | null; assigneeId?: string | null }
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;

    const card = await db.card.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return {
      id: card.id,
      columnId: card.columnId,
      title: card.title,
      description: card.description,
      position: card.position,
      deadline: card.deadline?.toISOString() ?? null,
      assignee: card.assignee,
    };
  },

  /** Move a card to a target column at a specific position */
  async move(cardId: string, targetColumnId: string, targetPosition: number) {
    await db.$transaction(async (tx) => {
      const card = await tx.card.findUniqueOrThrow({ where: { id: cardId } });

      const isSameColumn = card.columnId === targetColumnId;

      if (isSameColumn) {
        // Shift cards between old and new position
        if (targetPosition > card.position) {
          await tx.card.updateMany({
            where: {
              columnId: targetColumnId,
              position: { gt: card.position, lte: targetPosition },
            },
            data: { position: { decrement: 1 } },
          });
        } else if (targetPosition < card.position) {
          await tx.card.updateMany({
            where: {
              columnId: targetColumnId,
              position: { gte: targetPosition, lt: card.position },
            },
            data: { position: { increment: 1 } },
          });
        }
      } else {
        // Remove from old column — shift down
        await tx.card.updateMany({
          where: {
            columnId: card.columnId,
            position: { gt: card.position },
          },
          data: { position: { decrement: 1 } },
        });
        // Insert into new column — shift up
        await tx.card.updateMany({
          where: {
            columnId: targetColumnId,
            position: { gte: targetPosition },
          },
          data: { position: { increment: 1 } },
        });
      }

      await tx.card.update({
        where: { id: cardId },
        data: { columnId: targetColumnId, position: targetPosition },
      });
    });
  },

  /** Delete a card and re-pack positions */
  async delete(id: string) {
    const card = await db.card.findUniqueOrThrow({ where: { id } });
    await db.$transaction([
      db.card.delete({ where: { id } }),
      db.card.updateMany({
        where: { columnId: card.columnId, position: { gt: card.position } },
        data: { position: { decrement: 1 } },
      }),
    ]);
  },

  /** Full card detail with labels, comments, attachments */
  async getDetail(cardId: string) {
    const card = await db.card.findUniqueOrThrow({
      where: { id: cardId },
      include: {
        column: { select: { id: true, title: true, boardId: true } },
        assignee: { select: { id: true, name: true, email: true, image: true } },
        labels: { include: { label: true } },
        comments: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
        attachments: { orderBy: { createdAt: "desc" } },
      },
    });

    return {
      id: card.id,
      columnId: card.columnId,
      columnTitle: card.column.title,
      boardId: card.column.boardId,
      title: card.title,
      description: card.description,
      position: card.position,
      deadline: card.deadline?.toISOString() ?? null,
      assignee: card.assignee,
      labels: card.labels.map((cl) => ({
        id: cl.label.id,
        name: cl.label.name,
        color: cl.label.color,
      })),
      comments: card.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        user: c.user,
      })),
      attachments: card.attachments.map((a) => ({
        id: a.id,
        name: a.name,
        url: `/uploads/${a.s3Key}`,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  },

  /** Copy a card to a target column */
  async copy(cardId: string, targetColumnId: string) {
    const source = await db.card.findUniqueOrThrow({
      where: { id: cardId },
      include: { labels: true },
    });

    const maxPos = await db.card.aggregate({
      where: { columnId: targetColumnId },
      _max: { position: true },
    });
    const position = (maxPos._max.position ?? -1) + 1;

    const newCard = await db.card.create({
      data: {
        columnId: targetColumnId,
        title: source.title,
        description: source.description,
        position,
        deadline: source.deadline,
        assigneeId: source.assigneeId,
        labels: {
          create: source.labels.map((cl) => ({ labelId: cl.labelId })),
        },
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return {
      id: newCard.id,
      columnId: newCard.columnId,
      title: newCard.title,
      description: newCard.description,
      position: newCard.position,
      deadline: newCard.deadline?.toISOString() ?? null,
      assignee: newCard.assignee,
    };
  },

  /** Get the columnId + boardId for a card (for auth checks) */
  async getContext(cardId: string) {
    const card = await db.card.findUnique({
      where: { id: cardId },
      include: { column: { select: { boardId: true } } },
    });
    if (!card) return null;
    return { columnId: card.columnId, boardId: card.column.boardId };
  },
};
