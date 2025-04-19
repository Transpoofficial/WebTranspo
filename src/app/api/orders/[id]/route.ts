import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await checkAuth(req);
    const { id } = await params;
    const orderId = id;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        transportation: {
          include: {
            vehicles: {
              include: {
                vehicleType: true,
              },
            },
            destinations: true,
          },
        },
        packageOrder: true,
      },
    });
    if (!order) {
      return NextResponse.json(
        { message: "Order not found", data: [] },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Order retrieved successfully", data: order },
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
