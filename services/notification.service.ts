import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

export type NotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

export const notificationService = {
  async listByUser(userId: string, options?: { limit?: number; unreadOnly?: boolean }) {
    const limit = options?.limit ?? 50;
    return db.notification.findMany({
      where: { userId, ...(options?.unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getUnreadCount(userId: string): Promise<number> {
    return db.notification.count({ where: { userId, isRead: false } });
  },

  async create(userId: string, data: NotificationPayload) {
    return db.notification.create({
      data: { userId, type: data.type, title: data.title, message: data.message, link: data.link ?? null },
    });
  },

  async markAsRead(id: string, userId: string) {
    await db.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    await db.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  },
};
