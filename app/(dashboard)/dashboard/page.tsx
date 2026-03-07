import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role ?? "designer";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Signed in as <strong>{session.user.email}</strong> ({role.replace("_", " ")}).
      </p>
      {/* Role-based landing: PM → boards, Designer → tasks/points, etc. */}
    </div>
  );
}
