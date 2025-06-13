import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkAuth } from "@/lib/auth";

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // validasi autentikasi
    await checkAuth(req);

    // ambil parameter id dari URL
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing user ID", data: [] },
        { status: 400 }
      );
    }

    // cari user lama
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", data: [] },
        { status: 404 }
      );
    }

    // ambil body request
    const body = await req.json();
    const { fullName, email, password } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Nama lengkap dan email wajib diisi" },
        { status: 400 }
      );
    }

    // cek apakah email sudah digunakan oleh user lain
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah digunakan oleh user lain" },
        { status: 409 }
      );
    }

    // siapkan payload update
    const updateData: {
      fullName: string;
      email: string;
      password?: string;
    } = {
      fullName,
      email,
    };

    if (password && password.trim() !== "") {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "User updated successfully", data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};
