// Auth & session types — align with NextAuth
export type AppRole = "admin" | "project_manager" | "designer" | "finance" | "director";
export type BoardRole = "owner" | "editor" | "viewer";

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: AppRole;
}
