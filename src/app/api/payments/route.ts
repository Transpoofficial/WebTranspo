import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFiles } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { ResultUploadFiles } from "../../../../types/supabase";
import { getPaginationParams } from "@/utils/pagination";

export const GET = async (req: NextRequest) => {
  try {
    await checkAuth(req);
    const { skip, limit } = getPaginationParams(req.url);

    // Get total count
    const totalCount = await prisma.payment.count();

    const payments = await prisma.payment.findMany({
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        message: "Payments retrieved successfully",
        data: payments,
        pagination: {
          total: totalCount,
          skip,
          limit,
          hasMore: skip + payments.length < totalCount,
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

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const orderId = formData.get("orderId") as string;
    const senderName = formData.get("senderName") as string;
    const transferDate = formData.get("transferDate") as string;
    const photo = formData.get("photo") as File;
    const totalPrice = formData.get("totalPrice") as string;
    if (!orderId || !senderName || !transferDate || !photo || !totalPrice) {
      return NextResponse.json(
        { message: "All fields are required", data: [] },
        { status: 400 }
      );
    }

    const token = await checkAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    if (isNaN(Number(totalPrice))) {
      return NextResponse.json(
        { message: "Total price must be a valid number", data: [] },
        { status: 400 }
      );
    }
    const result: ResultUploadFiles = await uploadFiles(
      "testing",
      [photo],
      "proof"
    );
    if (result.some((tmp) => tmp.success === false)) {
      return NextResponse.json(
        { message: "File upload failed", data: [] },
        { status: 500 }
      );
    }
    const createdPayment = await prisma.payment.create({
      data: {
        orderId,
        senderName,
        transferDate: new Date(transferDate),
        totalPrice: Number(totalPrice),
        proofUrl: result[0].photoUrl.data.publicUrl,
        approvedByAdminId: token.id,
        paymentStatus: "PENDING",
      },
    });
    return NextResponse.json(
      {
        message: "Payment created successfully",
        data: createdPayment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};
