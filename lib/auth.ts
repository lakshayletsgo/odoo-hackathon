import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

// Workaround for NextAuth v5 beta type issues
const { auth, signIn, signOut, handlers } = (NextAuth as any)({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isVerified || !user.isActive || user.isBanned) {
          throw new Error("Account is not verified, inactive, or banned");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string, 
          user.password || ""
        );
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          isBanned: user.isBanned,
        };
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        // Check if user is banned
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { isBanned: true },
        });

        if (dbUser?.isBanned) {
          throw new Error(
            "Your account has been banned. Please contact support."
          );
        }

        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            role: true,
            name: true,
            isBanned: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.isBanned = dbUser.isBanned;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        (session.user as any).isBanned = token.isBanned as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
});

export { auth, handlers, signIn, signOut };
