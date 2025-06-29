import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token dan password harus diisi" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password harus minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Find user with valid token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token reset password tidak valid atau sudah kadaluarsa" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Update password and remove reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Password berhasil direset" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
