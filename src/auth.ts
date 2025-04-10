import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import authConfig from "./auth.config";
import { db } from "./lib/db";
import { UserRole } from "@prisma/client";
import { getUserById } from "./data/user";
import { AUTH_ROUTES } from "./routes";
import { getAccountByUserId } from "./data/account";
import type { Adapter } from "next-auth/adapters";

declare module "next-auth" {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface User {
    role: UserRole;
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface Session {
    user: {
      role: UserRole;
      isOAuth: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface JWT {
    role: UserRole;
    isOAuth: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: AUTH_ROUTES.LOGIN,
    error: AUTH_ROUTES.ERROR,
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider === "credentials") {
        const existingUser = await getUserById(user.id as string);
        if (!existingUser?.emailVerified) {
          return false;
        }
      }

      return true;
    },
    session: async ({ session, token }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      const dbUser = await getUserById(session.user.id);

      session.user.role = dbUser?.role ?? (token.role as UserRole);
      session.user.email = dbUser?.email ?? token.email ?? "";
      session.user.name = dbUser?.name ?? token.name;
      session.user.isOAuth = !!token.isOAuth;

      return session;
    },
    jwt: async ({ token, user }) => {
      if (!user) {
        return token;
      }

      const existingAccount = await getAccountByUserId(user.id as string);

      token.role = user.role;
      token.email = user.email;
      token.name = user.name;
      token.isOAuth = !!existingAccount;

      return token;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  ...authConfig,
});
