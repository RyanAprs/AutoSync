import type { AppRole } from "@/types/auth";

export type NavItem = {
  href: string;
  label: string;
  icon?: "dashboard" | "boards" | "points" | "payments" | "analytics" | "settings" | "users";
};

const ALL_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/boards", label: "Boards", icon: "boards" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const BY_ROLE: Record<AppRole, NavItem[]> = {
  admin: [
    ...ALL_NAV,
    { href: "/points", label: "Points", icon: "points" },
    { href: "/payments", label: "Payments", icon: "payments" },
    { href: "/analytics", label: "Analytics", icon: "analytics" },
    { href: "/admin/users", label: "Users", icon: "users" },
  ],
  project_manager: [...ALL_NAV],
  designer: [...ALL_NAV, { href: "/points", label: "Points", icon: "points" }],
  finance: [...ALL_NAV, { href: "/payments", label: "Payments", icon: "payments" }],
  director: [...ALL_NAV, { href: "/analytics", label: "Analytics", icon: "analytics" }],
};

export function getNavItemsForRole(role: AppRole | undefined): NavItem[] {
  if (!role || !BY_ROLE[role]) return ALL_NAV;
  return BY_ROLE[role];
}
