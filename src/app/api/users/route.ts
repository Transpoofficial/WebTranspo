import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkAuth } from "@/lib/auth";
import { getPaginationParams } from "@/utils/pagination";

export const GET = async (req: NextRequest) => {
  try {
    const { skip, limit } = getPaginationParams(req.url);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Get total count with search filter
    const totalCount = await prisma.user.count({
      where: {
        OR: [
          {
            fullName: {
              contains: search,
              // mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              // mode: "insensitive",
            },
          },
        ],
      },
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            fullName: {
              contains: search,
              // mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              // mode: "insensitive",
            },
          },
        ],
      },
      skip,
      take: limit,
      omit: {
        password: true,
      },
    });

    return NextResponse.json(
      {
        message: "Users retrieved successfully",
        data: users,
        pagination: {
          total: totalCount,
          skip,
          limit,
          hasMore: skip + users.length < totalCount,
        },
      },
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
