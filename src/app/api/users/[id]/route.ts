import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkAuth } from "@/lib/auth";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: id },
      omit: {
        password: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found", data: [] },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "User retrieved successfully", data: user },
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

// This endpoint is just to update a existing admin from super admin account
// This endpoint is not used in the app, but it is used in the admin panel
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await checkAuth(req, ["SUPER_ADMIN"]);
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields", data: [] },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found", data: [] },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { fullname, email, password, phoneNumber, role } = body;

    if (!fullname || !email || !phoneNumber) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { phoneNumber: phoneNumber }],
        NOT: { id: id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Prepare update data
    const updateData: {
      fullName: string;
      email: string;
      phoneNumber: string;
      role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
      password?: string;
    } = {
      fullName: fullname,
      email,
      phoneNumber,
      role: role as "CUSTOMER" | "ADMIN" | "SUPER_ADMIN",
    };

    // Only hash and update password if it's provided and not empty
    if (password && password.trim() !== "") {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // validate if user is super admin
    await checkAuth(req, ["SUPER_ADMIN"]);
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found", data: [] },
        { status: 404 }
      );
    }
    await prisma.user.delete({
      where: { id: id },
    });
    return NextResponse.json(
      { message: "User deleted successfully", data: [] },
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
