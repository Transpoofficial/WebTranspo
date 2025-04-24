import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Check current user role
    await checkAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const { orderStatus } = body;
    if (!id || !orderStatus) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    // Validate orderStatus
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"]; // REFUNDED status is not available yet
    if (!validStatuses.includes(orderStatus.toUpperCase())) {
      return NextResponse.json(
        { message: "Invalid order status", data: [] },
        { status: 400 }
      );
    }
    const order = await prisma.order.update({
      where: { id: id },
      data: { orderStatus: orderStatus.toUpperCase() },
    });
    return NextResponse.json(
      { message: "Order status updated successfully", data: order },
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
