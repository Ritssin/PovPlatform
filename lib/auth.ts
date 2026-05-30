import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { db } from "./db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    // ── To re-enable SSO: uncomment the block below ─────────────────────────
    // import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
    // MicrosoftEntraID({
    //   clientId:     process.env.AZURE_AD_CLIENT_ID!,
    //   clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    //   issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
    // }),
    // ────────────────────────────────────────────────────────────────────────
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // `user` is only populated on the initial sign-in from authorize()
      if (user) {
        token.id = user.id;
        const dbUser = await db.user.findUnique({ where: { id: user.id } });
        token.role = dbUser?.role ?? Role.SE;
      }
      return token;
    },
  },
});
