import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { checkAuth } from "@/lib/auth";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const role = (["USER", "ADMIN", "SUPER_ADMIN"] as const).includes(
      searchParams.get("role") as "USER" | "ADMIN" | "SUPER_ADMIN"
    )
      ? (searchParams.get("role") as "USER" | "ADMIN" | "SUPER_ADMIN")
      : "USER";
    const roleMapping = {
      USER: Role.CUSTOMER,
      ADMIN: Role.ADMIN,
      SUPER_ADMIN: Role.SUPER_ADMIN,
    };

    const mappedRole = roleMapping[role];
    console.log({ role });
    const users = await prisma.user.findMany({
      where: {
        role: mappedRole,
      },
      omit: {
        password: true,
      },
    });
    return NextResponse.json(
      { message: "Users retrieved successfully", data: users },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

// This endpoint is just to create a new admin from super admin account
// This endpoint is not used in the app, but it is used in the admin panel
export const POST = async (req: NextRequest) => {
  try {
    // validate if user is super admin
    await checkAuth(req, ["SUPER_ADMIN"]);
    const body = await req.json();
    const { fullname, email, password, phoneNumber } = body;
    if (!fullname || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { phoneNumber: phoneNumber }],
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName: fullname,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        phoneNumber,
      },
      omit: {
        password: true,
      },
    });
    return NextResponse.json(
      { message: "User registered successfully", data: user },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        data: [],
      },
      { status: 500 }
    );
  }
};
