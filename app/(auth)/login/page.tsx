import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm animate-pulse rounded-xl border bg-white p-8 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="h-8 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-4 h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-6 h-10 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-4 h-10 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-6 h-10 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
