import type { NextAuthConfig } from "next-auth";

// Role mirrored as string union so this file stays edge-safe (no @prisma/client import)
type Role = "SE" | "SME" | "MANAGER" | "ADMIN";

// Edge-compatible config — no Node.js-only imports (no bcryptjs, no db, no Prisma client)
export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [], // Credentials provider is added only in lib/auth.ts
  callbacks: {
    session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

// ── NextAuth type extensions (declared here so middleware picks them up) ──────

declare module "next-auth" {
  interface Session {
    user: {
      id:     string;
      name?:  string | null;
      email?: string | null;
      image?: string | null;
      role:   Role;
    };
  }
}

