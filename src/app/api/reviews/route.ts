import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        order: {
          include: {
            user: {
              omit: {
                password: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(
      { message: "Reviews retrieved successfully", data: reviews },
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
    const body = await req.json();
    const { orderId, rating, content } = body;
    await checkAuth(req);
    if (
      orderId === null ||
      orderId === undefined ||
      rating === null ||
      rating === undefined ||
      content === null ||
      content === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return NextResponse.json(
        { message: "Order not found", data: [] },
        { status: 404 }
      );
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be a number between 1 and 5", data: [] },
        { status: 400 }
      );
    }
    const review = await prisma.review.create({
      data: {
        orderId,
        rating: parseInt(rating),
        content,
      },
    });
    return NextResponse.json(
      { message: "Review created successfully", data: review },
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
