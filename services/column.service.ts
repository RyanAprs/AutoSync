import { db } from "@/lib/db";

export const columnService = {
  /** List columns with nested cards for a board */
  async listByBoard(boardId: string) {
    const columns = await db.column.findMany({
      where: { boardId },
      orderBy: { position: "asc" },
      include: {
        cards: {
          orderBy: { position: "asc" },
          include: {
            assignee: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    return columns.map((c) => ({
      id: c.id,
      title: c.title,
      position: c.position,
      cards: c.cards.map((card) => ({
        id: card.id,
        columnId: card.columnId,
        title: card.title,
        description: card.description,
        position: card.position,
        deadline: card.deadline?.toISOString() ?? null,
        assignee: card.assignee,
      })),
    }));
  },

  /** Create a column at the end */
  async create(boardId: string, data: { title: string }) {
    const maxPos = await db.column.aggregate({
      where: { boardId },
      _max: { position: true },
    });
    const position = (maxPos._max.position ?? -1) + 1;

    const column = await db.column.create({
      data: { boardId, title: data.title, position },
    });

    return {
      id: column.id,
      title: column.title,
      position: column.position,
      cards: [],
    };
  },

  /** Update column title */
  async update(id: string, data: { title?: string }) {
    const column = await db.column.update({
      where: { id },
      data: { title: data.title },
    });
    return { id: column.id, title: column.title, position: column.position };
  },

  /** Reorder columns by ID array */
  async reorder(boardId: string, columnIds: string[]) {
    await db.$transaction(
      columnIds.map((id, index) =>
        db.column.update({
          where: { id },
          data: { position: index },
        })
      )
    );
  },

  /** Delete a column and its cards */
  async delete(id: string) {
    await db.column.delete({ where: { id } });
  },

  /** Get the boardId for a column (for auth checks) */
  async getBoardId(columnId: string) {
    const col = await db.column.findUnique({
      where: { id: columnId },
      select: { boardId: true },
    });
    return col?.boardId ?? null;
  },
};
