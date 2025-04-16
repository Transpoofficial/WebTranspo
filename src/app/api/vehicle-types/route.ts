import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const vehicleTypes = await prisma.vehicleType.findMany();
    return NextResponse.json(
      { message: "Vehicle types retrieved successfully", data: vehicleTypes },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
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
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};
