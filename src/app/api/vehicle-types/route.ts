import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaginationParams } from "@/utils/pagination";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { skip, limit } = getPaginationParams(req.url);
    const search = req.nextUrl.searchParams.get("search") || "";

    if (search) {
      const vehicleType = await prisma.vehicleType.findFirst({
        where: { name: search },
      });
      if (vehicleType) {
        return NextResponse.json(
          {
            message: "Vehicle type retrieved successfully",
            data: [vehicleType],
            pagination: {
              total: 1,
              skip: 0,
              limit: 1,
              hasMore: false,
            },
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: "Vehicle type not found", data: [] },
          { status: 404 }
        );
      }
    }

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
    const { name, capacity, pricePerKm } = body;

    if (!name || !capacity) {
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
        capacity: parseInt(capacity),
        pricePerKm: parseFloat(pricePerKm),
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
