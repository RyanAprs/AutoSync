import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { AppRole } from "@prisma/client";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user?.passwordHash) return null;

        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
  callbacks: {
    jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: DefaultSession["user"] & { id?: string; role?: AppRole };
    }) {
      if (user) {
        token.id = "id" in user && user.id ? user.id : token.sub;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: { session: DefaultSession; token: JWT }) {
      if (session.user) {
        (session.user as { id: string }).id = token.sub ?? token.id ?? "";
        (session.user as { role: AppRole }).role =
          (token.role as AppRole) ?? "designer";
      }
      return session;
    },
  },
  events: {
    signIn: async () => {},
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Use in Server Components and API routes: getServerSession(authOptions)
export { getServerSession } from "next-auth";
