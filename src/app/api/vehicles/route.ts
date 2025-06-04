import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getPaginationParams } from "@/utils/pagination";

export const GET = async (req: NextRequest) => {
  try {
    const { skip, limit } = getPaginationParams(req.url);

    // Get total count
    const totalCount = await prisma.vehicle.count();

    const vehicles = await prisma.vehicle.findMany({
      skip,
      take: limit,
      include: {
        vehicleType: true,
      },
    });

    return NextResponse.json(
      {
        message: "Vehicles retrieved successfully",
        data: vehicles,
        pagination: {
          total: totalCount,
          skip,
          limit,
          hasMore: skip + vehicles.length < totalCount,
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
    await checkAuth(req);
    const body = await req.json();
    const { seatCount, ratePerKm, additionalDetails, vehicleTypeId } = body;
    // resume the code
    if (
      seatCount === null ||
      seatCount === undefined ||
      ratePerKm === null ||
      ratePerKm === undefined ||
      vehicleTypeId === null ||
      vehicleTypeId === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id: vehicleTypeId },
    });

    if (!vehicleType) {
      return NextResponse.json(
        { message: "Invalid vehicle type ID", data: [] },
        { status: 400 }
      );
    }
    const vehicle = await prisma.vehicle.create({
      data: {
        seatCount,
        ratePerKm,
        additionalDetails,
        vehicleTypeId,
      },
    });
    return NextResponse.json(
      { message: "Vehicle created successfully", data: vehicle },
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
