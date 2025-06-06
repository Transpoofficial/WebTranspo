import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaginationParams } from "@/utils/pagination";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { skip, limit } = getPaginationParams(req.url);

    // Get total count for pagination metadata
    const totalCount = await prisma.vehicleType.count();

    const vehicleTypes = await prisma.vehicleType.findMany({
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        message: "Vehicle types retrieved successfully",
        data: vehicleTypes,
        pagination: {
          total: totalCount,
          skip,
          limit,
          hasMore: skip + vehicleTypes.length < totalCount,
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
    // await checkAuth(req);
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }

    const existingVehicleType = await prisma.vehicleType.findFirst({
      where: { name: name },
    });
    if (existingVehicleType) {
      return NextResponse.json(
        { message: "Vehicle type already exists", data: [] },
        { status: 409 }
      );
    }

    const vehicleType = await prisma.vehicleType.create({
      data: {
        name,
      },
    });
    return NextResponse.json(
      { message: "Vehicle type created successfully", data: vehicleType },
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
