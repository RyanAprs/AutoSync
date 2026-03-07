import Link from "next/link";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNavItemsForRole } from "@/lib/nav-config";
import type { AppRole } from "@/types/auth";
import { SidebarNav } from "./sidebar-helper";

export async function Sidebar() {
  const session = (await getServerSession(authOptions)) as Session | null;
  const role = (session?.user as { role?: AppRole } | undefined)?.role;
  const navItems = getNavItemsForRole(role);

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          HelloFriday
        </Link>
      </div>
      <SidebarNav navItems={navItems} />
    </aside>
  );
}
