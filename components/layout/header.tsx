import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";

export async function Header() {
  const session = (await getServerSession(authOptions)) as Session | null;

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
      <UserMenu session={session} />
    </header>
  );
}
