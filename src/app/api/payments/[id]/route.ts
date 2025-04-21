import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const payment = await prisma.payment.findUnique({
      where: { id: id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                address: true,
                role: true,
              },
            },
          },
        },
      },
    });
    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found", data: [] },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Payment retrieved successfully", data: payment },
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
