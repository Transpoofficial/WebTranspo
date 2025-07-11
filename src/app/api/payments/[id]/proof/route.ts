import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFiles } from "@/utils/supabase";
import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    // Authentication
    const token = await checkAuth(req);
    const { id: paymentId } = await params;

    // Check if payment exists and belongs to user
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: {
          userId: token.id,
        },
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found", data: [] },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const senderName = formData.get("senderName") as string;
    const transferDate = formData.get("transferDate") as string;
    const proofImage = formData.get("proofImage") as File;

    if (!senderName || !transferDate || !proofImage) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }

    // Use the uploadFiles utility to upload to Supabase
    const uploadResult = await uploadFiles(
      process.env.SUPABASE_BUCKET || "",
      [proofImage],
      "payment-proofs" // directory for payment proofs
    );

    // Check if upload was successful
    if (!uploadResult[0].success) {
      return NextResponse.json(
        { message: "Failed to upload proof image", data: [] },
        { status: 500 }
      );
    }

    // Get the public URL from the upload result
    const fileUrl = uploadResult[0].photoUrl.data.publicUrl;

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        senderName,
        transferDate: new Date(transferDate),
        proofUrl: fileUrl,
        paymentStatus: PaymentStatus.PENDING, // Update status to indicate proof was uploaded
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Send email notification to user using existing API endpoint
    try {
      if (
        updatedPayment.order.user.email &&
        updatedPayment.order.user.fullName
      ) {
        // Call the existing email API endpoint
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const emailResponse = await fetch(`${baseUrl}/api/email/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: updatedPayment.order.user.email,
            fullName: updatedPayment.order.user.fullName,
            emailType: "payment-verification",
          }),
        });

        if (emailResponse.ok) {
          console.log(
            `Payment verification email sent to: ${updatedPayment.order.user.email}`
          );
        } else {
          const errorData = await emailResponse.json();
          console.error("Failed to send email:", errorData.message);
        }
      }
    } catch (emailError) {
      // Log email error but don't fail the main request
      console.error("Failed to send email notification:", emailError);
    }

    return NextResponse.json(
      {
        message: "Payment proof uploaded successfully",
        data: updatedPayment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};
