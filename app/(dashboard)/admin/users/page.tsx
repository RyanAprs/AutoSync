import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">User management</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Manage users and roles — to be implemented.
      </p>
    </div>
  );
}
