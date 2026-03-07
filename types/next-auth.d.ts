import "next-auth";
import type { AppRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role?: AppRole;
  }

  interface Session {
    user: User & {
      id: string;
      role?: AppRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
