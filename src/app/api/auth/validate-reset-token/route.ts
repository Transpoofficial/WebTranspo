import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { message: "Token reset password tidak ditemukan" },
        { status: 400 }
      );
    }

    // Find user with valid token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date(), // Token is not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token reset password tidak valid atau sudah kadaluarsa" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Token valid", valid: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Validate reset token error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
