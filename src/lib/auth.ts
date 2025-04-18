// lib/auth.ts
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function checkAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log({ token });
  if (!token) {
    throw new Error("Unauthorized");
  }
  return token;
}
