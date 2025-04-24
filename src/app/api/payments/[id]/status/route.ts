import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await checkAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    const payment = await prisma.payment.findUnique({
      where: { id: id },
    });
    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found", data: [] },
        { status: 404 }
      );
    }
    const body = await req.json();
    let { status } = body;
    if (!status) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    status = status.toUpperCase();
    if (
      status !== "PENDING" &&
      status !== "APPROVED" &&
      status !== "REJECTED"
    ) {
      return NextResponse.json(
        { message: "Invalid status", data: [] },
        { status: 400 }
      );
    }
    const updatedPayment = await prisma.payment.update({
      where: { id: id },
      data: {
        paymentStatus: status,
      },
    });
    return NextResponse.json(
      {
        message: "Payment status updated successfully",
        data: updatedPayment,
      },
      { status: 200 }
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
