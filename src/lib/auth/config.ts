import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { UserRole } from "@/lib/types/user";
import { loginSchema } from "@/lib/validations/auth";

declare module "next-auth" {
  interface User {
    role: UserRole;
    apartment: string | null;
    block: string | null;
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      apartment: string | null;
      block: string | null;
      mustChangePassword: boolean;
    };
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.active || !user.passwordHash) return null;

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          apartment: user.apartment,
          block: user.block,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.apartment = user.apartment;
        token.block = user.block;
        token.mustChangePassword = user.mustChangePassword;
      }
      if (
        trigger === "update" &&
        session &&
        typeof session === "object" &&
        "mustChangePassword" in session
      ) {
        token.mustChangePassword = session.mustChangePassword as boolean;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.apartment = token.apartment as string | null;
      session.user.block = token.block as string | null;
      session.user.mustChangePassword = token.mustChangePassword as boolean;
      return session;
    },
  },
};
