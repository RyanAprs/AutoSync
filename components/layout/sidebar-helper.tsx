"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "./sidebar-icons";
import type { NavItem } from "@/lib/nav-config";

interface SidebarNavProps {
  navItems: NavItem[];
}

export function SidebarNav({ navItems }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 p-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
              ${
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }
            `}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition
                ${
                  isActive
                    ? "bg-white text-zinc-700 shadow-sm dark:bg-zinc-700 dark:text-zinc-200"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }
              `}
            >
              <NavIcon name={item.icon} />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
