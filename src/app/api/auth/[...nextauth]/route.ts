import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma"; // Ensure you have prisma set up
import Google from "next-auth/providers/google";

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
          user.password
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
  ],
  session: {
    strategy: "jwt", // Using JWT for session management
  },
  pages: {
    signIn: "/auth/signin", // Customize your sign-in page if necessary
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.fullName = user.fullName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token?.id as string;
        session.user.email = token.email;
        session.user.fullName = token.fullName;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your_secret_key", // Optional, specify a JWT secret
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
