import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email harus diisi" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success for security (not revealing whether email exists)
    if (!user) {
      return NextResponse.json(
        { message: "Jika email terdaftar, link reset password telah dikirim" },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetTokenExpiry,
      },
    });

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // Send email using existing API endpoint
    try {
      const emailResponse = await fetch(
        `${process.env.NEXTAUTH_URL}/api/email/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            fullName: user.fullName,
            emailType: "forgot-password",
            resetLink: resetLink,
          }),
        }
      );

      if (!emailResponse.ok) {
        throw new Error("Failed to send email");
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Remove token if email sending fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpiry: null,
        },
      });
      return NextResponse.json(
        { message: "Gagal mengirim email reset password" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Jika email terdaftar, link reset password telah dikirim" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
