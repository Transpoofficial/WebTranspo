// lib/auth.ts
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function checkAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // Uncomment the following line for debugging purposes only in a secure environment:
  // console.log({ token: token ? token.substring(0, 5) + '...' : null });
  if (!token) {
    throw new Error("Unauthorized");
  }
  return token;
}
