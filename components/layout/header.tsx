import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./toggle-theme";

export async function Header() {
  const session = (await getServerSession(authOptions)) as Session | null;

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div />
      <div className="flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
        <UserMenu session={session} />
      </div>
    </header>
  );
}
