"use server";

import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import type { AppRole } from "@prisma/client";

const SALT_ROUNDS = 10;

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function register(data: {
  email: string;
  password: string;
  name?: string;
  role?: AppRole;
}): Promise<RegisterResult> {
  const email = data.email.trim().toLowerCase();
  if (!email) return { success: false, error: "Email is required" };
  if (!data.password || data.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing)
    return {
      success: false,
      error: "An account with this email already exists",
    };

  const passwordHash = await hash(data.password, SALT_ROUNDS);

  await db.user.create({
    data: {
      email,
      passwordHash,
      name: data.name?.trim() || null,
      role: data.role ?? "designer",
    },
  });

  return { success: true };
}
