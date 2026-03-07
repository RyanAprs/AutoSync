"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface Props {
  session: Session | null;
}

export function UserMenu({ session }: Props) {
  if (!session?.user) return null;

  const role = (session.user as { role?: string }).role;
  const label = role ? role.replace("_", " ") : "User";

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{session.user.email}</span>
        <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
          {label}
        </span>
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Sign out
      </button>
    </div>
  );
}
