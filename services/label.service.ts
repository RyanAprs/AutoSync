import { db } from "@/lib/db";

export const labelService = {
  /** List all labels for a board */
  async listByBoard(boardId: string) {
    const labels = await db.label.findMany({
      where: { boardId },
      orderBy: { color: "asc" },
    });
    return labels.map((l) => ({
      id: l.id,
      name: l.name,
      color: l.color,
    }));
  },

  /** Create a label */
  async create(boardId: string, data: { name: string; color: string }) {
    const label = await db.label.create({
      data: { boardId, name: data.name, color: data.color },
    });
    return { id: label.id, name: label.name, color: label.color };
  },

  /** Update a label */
  async update(id: string, data: { name?: string; color?: string }) {
    const label = await db.label.update({
      where: { id },
      data,
    });
    return { id: label.id, name: label.name, color: label.color };
  },

  /** Delete a label */
  async delete(id: string) {
    await db.label.delete({ where: { id } });
  },

  /** Toggle a label on a card (add if missing, remove if present) */
  async toggleOnCard(cardId: string, labelId: string) {
    const existing = await db.cardLabel.findUnique({
      where: { cardId_labelId: { cardId, labelId } },
    });

    if (existing) {
      await db.cardLabel.delete({
        where: { cardId_labelId: { cardId, labelId } },
      });
      return { action: "removed" as const };
    } else {
      await db.cardLabel.create({
        data: { cardId, labelId },
      });
      return { action: "added" as const };
    }
  },

  /** Get labels assigned to a card */
  async getCardLabels(cardId: string) {
    const cardLabels = await db.cardLabel.findMany({
      where: { cardId },
      include: { label: true },
    });
    return cardLabels.map((cl) => ({
      id: cl.label.id,
      name: cl.label.name,
      color: cl.label.color,
    }));
  },
};
