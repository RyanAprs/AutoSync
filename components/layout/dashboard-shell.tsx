import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
