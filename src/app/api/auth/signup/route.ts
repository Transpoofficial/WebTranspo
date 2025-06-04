import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: Role.CUSTOMER,
        // !TODO: Remove this when phone number is implemented
      },
    });
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
