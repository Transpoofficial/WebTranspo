// lib/auth.ts
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

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
