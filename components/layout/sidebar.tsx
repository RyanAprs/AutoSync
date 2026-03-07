import Link from "next/link";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNavItemsForRole } from "@/lib/nav-config";
import { NavIcon } from "./sidebar-icons";
import type { AppRole } from "@/types/auth";

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
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <NavIcon name={item.icon} />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
