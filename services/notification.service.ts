// Create notification, list by user, mark read — to be implemented
export const notificationService = {
  create: async (userId: string, data: { type: string; title: string; message: string; link?: string }) => null,
  listByUser: async (userId: string) => [],
  markAsRead: async (id: string) => {},
  markAllAsRead: async (userId: string) => {},
};
