import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendPaymentApprovalWithInvoice,
  sendPaymentRejectionEmail,
} from "@/lib/payment-approval";
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
    const { note } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }

    // Check if note is required for REJECTED status
    if (status.toUpperCase() === "REJECTED" && !note) {
      return NextResponse.json(
        { message: "Note is required for rejected status", data: [] },
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
        note: note || null, // Set note to null if not provided
      },
    }); // Send email with invoice if payment is approved
    if (status === "APPROVED") {
      try {
        await sendPaymentApprovalWithInvoice(id);
      } catch (emailError) {
        console.error(
          `Failed to send approval email for payment ${id}:`,
          emailError
        );
        // Don't fail the status update if email fails
        // The payment status should still be updated successfully
      }
    }

    // Send rejection email if payment is rejected
    if (status === "REJECTED" && note) {
      try {
        await sendPaymentRejectionEmail(id, note);
      } catch (emailError) {
        console.error(
          `Failed to send rejection email for payment ${id}:`,
          emailError
        );
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json(
      {
        message: "Payment status updated successfully",
        data: updatedPayment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        data: [],
      },
      { status: 500 }
    );
  }
};
