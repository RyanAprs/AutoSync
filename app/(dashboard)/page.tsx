import { redirect } from "next/navigation";

/** Dashboard route group root: redirect to /dashboard so the main dashboard has a clear URL. */
export default function DashboardRootPage() {
  redirect("/dashboard");
}
