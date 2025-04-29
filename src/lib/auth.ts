// lib/auth.ts
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { NextAuthOptions } from "next-auth";

export async function checkAuth(
  req: NextRequest,
  roles?: Array<"SUPER_ADMIN" | "ADMIN" | "CUSTOMER">
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log({ token });
  if (!token) {
    throw new Error("Unauthorized");
  }
  if (roles && roles.length > 0) {
    const user = await prisma.user.findFirst({
      where: {
        id: token.id,
      },
    });
    if (!user) {
      throw new Error("Unauthorized");
    }
    if (!roles.includes(user.role)) {
      throw new Error("Unauthorized");
    }
  }
  return token;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid email or password.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password as string
        );
        if (!isPasswordValid) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName || "Unknown", // Provide a fallback for null fullNames
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          role: "CUSTOMER", // Provide a fallback for null roles
          fullName: profile.name || "Unknown", // Provide a fallback for null fullNames
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for session management
  },
  pages: {
    signIn: "/auth/signin", // Customize your sign-in page if necessary
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              fullName: user.fullName,
              role: Role.CUSTOMER,
              password: "", // Google sign-in doesn't require a password,
              phoneNumber: "", // Add any other default values you want
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        });
        if (dbUser) token.id = dbUser.id;
        token.email = user.email;
        token.fullName = user.fullName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          email: token.email,
          fullName: token.fullName,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your_secret_key", // Optional, specify a JWT secret
};
