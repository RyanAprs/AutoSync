"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useNotifications,
  type NotificationItem,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 rounded-full px-1.5 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>

        <Separator />

        {/* Body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-95">
            <ul>
              {notifications.map((n: NotificationItem, i) => (
                <>
                  <NotificationRow
                    key={n.id}
                    item={n}
                    onMarkRead={() => markAsRead(n.id)}
                    onClose={() => setOpen(false)}
                  />
                  {i < notifications.length - 1 && (
                    <Separator key={`sep-${n.id}`} />
                  )}
                </>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  item,
  onMarkRead,
  onClose,
}: {
  item: NotificationItem;
  onMarkRead: () => void;
  onClose: () => void;
}) {
  const inner = (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
        !item.isRead && "bg-muted/30",
      )}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            item.isRead ? "bg-transparent" : "bg-blue-500",
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {item.message}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground/60">
          {formatTime(item.createdAt)}
        </p>
      </div>
    </div>
  );

  return (
    <li>
      {item.link ? (
        <Link
          href={item.link}
          className="block"
          onClick={() => {
            if (!item.isRead) onMarkRead();
            onClose();
          }}
        >
          {inner}
        </Link>
      ) : (
        <button
          type="button"
          className="w-full"
          onClick={() => {
            if (!item.isRead) onMarkRead();
          }}
        >
          {inner}
        </button>
      )}
    </li>
  );
}
