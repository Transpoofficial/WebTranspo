import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id: id },
    });
    if (!vehicleType) {
      return NextResponse.json(
        { message: "Vehicle type not found", data: [] },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Vehicle type retrieved successfully", data: vehicleType },
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
    await checkAuth(req);
    const { id } = await params;
    const body = await req.json();
    const { name, capacity, pricePerKm } = body;
    if (!name || !capacity || !pricePerKm) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const existingVehicleType = await prisma.vehicleType.findUnique({
      where: { id: id },
    });
    if (!existingVehicleType) {
      return NextResponse.json(
        { message: "Vehicle type not found", data: [] },
        { status: 404 }
      );
    }

    const vehicleTypeWithSameName = await prisma.vehicleType.findFirst({
      where: { name: name },
    });
    if (vehicleTypeWithSameName && vehicleTypeWithSameName.id !== id) {
      return NextResponse.json(
        { message: "Vehicle type with this name already exists", data: [] },
        { status: 409 }
      );
    }
    const updatedVehicleType = await prisma.vehicleType.update({
      where: { id: id },
      data: { name, capacity: parseInt(capacity), pricePerKm },
    });
    return NextResponse.json(
      {
        message: "Vehicle type updated successfully",
        data: updatedVehicleType,
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await checkAuth(req);
    const { id } = await params;
    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id: id },
    });
    if (!vehicleType) {
      return NextResponse.json(
        { message: "Vehicle type not found", data: [] },
        { status: 404 }
      );
    }
    await prisma.vehicleType.delete({
      where: { id: id },
    });
    return NextResponse.json(
      { message: "Vehicle type deleted successfully", data: [] },
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
