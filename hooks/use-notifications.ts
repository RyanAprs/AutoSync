"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const NOTIFICATIONS_KEY = ["notifications"] as const;
const POLL_KEY = ["notifications", "poll"] as const;

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};

async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch("/api/notifications?limit=30");
  if (!res.ok) {
    if (res.status === 401) return { notifications: [], unreadCount: 0 };
    throw new Error("Failed to fetch notifications");
  }
  return res.json();
}

async function markOneRead(id: string): Promise<void> {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to mark as read");
}

async function markAllRead(): Promise<void> {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ all: true }),
  });
  if (!res.ok) throw new Error("Failed to mark all as read");
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: fetchNotifications,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: POLL_KEY });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: POLL_KEY });
    },
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    refetch,
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    isMarkingRead: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
  };
}
