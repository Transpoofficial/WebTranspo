import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const vehicleId = params.id;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        vehicleType: true,
      },
    });
    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found", data: [] },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Vehicle retrieved successfully", data: vehicle },
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
  { params }: { params: { id: string } }
) => {
  try {
    await checkAuth(req);
    const vehicleId = params.id;
    const body = await req.json();
    const { seatCount, ratePerKm, additionalDetails, vehicleTypeId } = body;
    if (seatCount === null || seatCount === undefined || 
        ratePerKm === null || ratePerKm === undefined || 
        vehicleTypeId === null || vehicleTypeId === undefined) {
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
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        seatCount,
        ratePerKm,
        additionalDetails,
        vehicleTypeId,
      },
    });
    return NextResponse.json(
      { message: "Vehicle updated successfully", data: vehicle },
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
  { params }: { params: { id: string } }
) => {
  try {
    await checkAuth(req);
    const vehicleId = params.id;
    let vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found", data: [] },
        { status: 404 }
      );
    }
    vehicle = await prisma.vehicle.delete({
      where: { id: vehicleId },
    });
    return NextResponse.json(
      { message: "Vehicle deleted successfully", data: vehicle },
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
