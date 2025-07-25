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
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token",
  });

  if (!token) {
    console.error("❌ checkAuth - No token found");
    throw new Error("Unauthorized");
  }

  if (roles && roles.length > 0) {
    const user = await prisma.user.findFirst({
      where: {
        id: token.id,
      },
    });

    if (!user) {
      console.error("❌ checkAuth - User not found in DB");
      throw new Error("Unauthorized");
    }
    if (!roles.includes(user.role)) {
      console.error(
        "❌ checkAuth - User role not allowed:",
        user.role,
        "Required:",
        roles
      );
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
          user.password as string // TODO : remove this cast when password is not null
        );
        if (!isPasswordValid) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName || "Unknown",
          role: user.role,
          phoneNumber: user.phoneNumber || "", // Provide a fallback for null phoneNumbers
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          role: "CUSTOMER", // Provide a fallback for null roles
          fullName: profile.name || "Unknown", // Provide a fallback for null fullNames
          phoneNumber: "", // Google sign-in doesn't provide phone numbers, so we set it to an empty string
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Using JWT for session management
  },
  pages: {
    signIn: "/auth/signin", // Customize your sign-in page if necessary
    signOut: "/auth/signin", // Add this to redirect to the signin page after logout
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "lax", // Adjust as needed,
        path: "/", // Cookie path
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              fullName: user.fullName,
              role: Role.CUSTOMER,
              password: null, // Set to null instead of empty string for Google OAuth
              phoneNumber: null, // Set to null instead of empty string for Google OAuth
            },
          });

          // Send verification email for new Google users
          try {
            const emailResponse = await fetch(
              `${process.env.NEXTAUTH_URL}/api/email/send`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  to: newUser.email,
                  fullName: newUser.fullName,
                  emailType: "register-verification",
                }),
              }
            );

            if (!emailResponse.ok) {
              console.error(
                "Failed to send verification email for Google signup"
              );
            }
          } catch (emailError) {
            console.error(
              "Error sending verification email for Google signup:",
              emailError
            );
          }
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
        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.fullName = dbUser.fullName;
          token.role = dbUser.role;
          token.phoneNumber = dbUser.phoneNumber || ""; // Provide a fallback for null phoneNumbers
        }
      }
      return token;
    },
    async session({ session, user }) {
      // Jika menggunakan adapter, user akan tersedia
      if (user) {
        session.user.id = user.id;
        session.user.fullName = user.fullName;
        session.user.email = user.email;
        session.user.role = user.role;
        session.user.phoneNumber = user.phoneNumber || ""; // Provide a fallback for null phoneNumbers
      } else {
        // Jika menggunakan JWT, ambil data terbaru dari database
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            phoneNumber: true,
          },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.fullName = dbUser.fullName;
          session.user.email = dbUser.email;
          session.user.role = dbUser.role;
          session.user.phoneNumber = dbUser.phoneNumber || ""; // Provide a fallback for null phoneNumbers
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your_secret_key", // Optional, specify a JWT secret
};
