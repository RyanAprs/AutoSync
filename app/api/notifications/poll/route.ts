import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notificationService } from "@/services/notification.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ unreadCount: 0, hasNew: false });
  }

  const unreadCount = await notificationService.getUnreadCount(userId);
  return NextResponse.json({ unreadCount, hasNew: unreadCount > 0 });
}
