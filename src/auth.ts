import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import authConfig from "./auth.config";
import { db } from "./lib/db";
import { UserRole } from "@prisma/client";
import { getUserById } from "./data/user";
import { AUTH_ROUTES } from "./routes";

declare module "next-auth" {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface User {
    role: UserRole;
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface JWT {
    role: UserRole;
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

      if (token.role) {
        session.user.role = token.role;
        session.user.email = token.email ?? "";
        session.user.name = token.name;
      }

      return session;
    },
    jwt: async ({ token, user }) => {
      if (!user) {
        return token;
      }

      token.role = user.role;
      token.email = user.email;
      token.name = user.name;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
