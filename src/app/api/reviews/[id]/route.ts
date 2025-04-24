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
    const review = await prisma.review.findUnique({
      where: { id: id },
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
    if (!review) {
      return NextResponse.json(
        { message: "Review not found", data: [] },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Review retrieved successfully", data: review },
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

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { rating, content } = body;
    if (
      rating === null ||
      rating === undefined ||
      content === null ||
      content === undefined ||
      id === null ||
      id === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const review = await prisma.review.findUnique({
      where: { id: id },
    });
    if (!review) {
      return NextResponse.json(
        { message: "Review not found", data: [] },
        { status: 404 }
      );
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be a number between 1 and 5", data: [] },
        { status: 400 }
      );
    }
    const updatedReview = await prisma.review.update({
      where: { id: id },
      data: {
        rating: parseInt(rating),
        content,
      },
    });
    return NextResponse.json(
      { message: "Review updated successfully", data: updatedReview },
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

export const DELETE = async (
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
    const review = await prisma.review.findUnique({
      where: { id: id },
    });
    if (!review) {
      return NextResponse.json(
        { message: "Review not found", data: [] },
        { status: 404 }
      );
    }
    await prisma.review.delete({
      where: { id: id },
    });
    return NextResponse.json(
      { message: "Review deleted successfully", data: review },
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
