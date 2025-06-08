import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Price calculation functions for each vehicle type
function calculateAngkotPrice(
  distanceKm: number,
  vehicleCount: number
): number {
  // Placeholder formula for Angkot
  // Base rate: 5000 per km, minimum charge of 100,000
  const baseRate = 5000;
  const minCharge = 100000;

  let price = baseRate * distanceKm * vehicleCount;
  return price < minCharge ? minCharge : price;
}

function calculateHiaceCommuterPrice(
  distanceKm: number,
  vehicleCount: number
): number {
  // Placeholder formula for HIACE Commuter
  // Base rate: 7000 per km, minimum charge of 150,000
  const baseRate = 7000;
  const minCharge = 150000;

  let price = baseRate * distanceKm * vehicleCount;
  return price < minCharge ? minCharge : price;
}

function calculateHiacePremioPrice(
  distanceKm: number,
  vehicleCount: number
): number {
  // Placeholder formula for HIACE Premio
  // Base rate: 10000 per km, minimum charge of 200,000
  const baseRate = 10000;
  const minCharge = 200000;

  let price = baseRate * distanceKm * vehicleCount;
  return price < minCharge ? minCharge : price;
}

function calculateElfPrice(distanceKm: number, vehicleCount: number): number {
  // Placeholder formula for Elf
  // Base rate: 8000 per km, minimum charge of 180,000
  const baseRate = 8000;
  const minCharge = 180000;

  let price = baseRate * distanceKm * vehicleCount;
  return price < minCharge ? minCharge : price;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vehicleTypeId, totalDistance, vehicleCount = 1 } = body;

    if (!vehicleTypeId || totalDistance === undefined) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: vehicleTypeId and totalDistance required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Get vehicle type details
    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id: vehicleTypeId },
    });

    if (!vehicleType) {
      return NextResponse.json(
        { message: "Vehicle type not found", data: null },
        { status: 404 }
      );
    }

    // Convert distance from meters to kilometers
    const distanceKm = totalDistance / 1000;
    let totalPrice = 0;

    // Calculate price based on vehicle type
    const vehicleTypeName = vehicleType.name.toLowerCase();

    if (vehicleTypeName.includes("angkot")) {
      totalPrice = calculateAngkotPrice(distanceKm, vehicleCount);
    } else if (
      vehicleTypeName.includes("hiace") &&
      vehicleTypeName.includes("commuter")
    ) {
      totalPrice = calculateHiaceCommuterPrice(distanceKm, vehicleCount);
    } else if (
      vehicleTypeName.includes("hiace") &&
      vehicleTypeName.includes("premio")
    ) {
      totalPrice = calculateHiacePremioPrice(distanceKm, vehicleCount);
    } else if (vehicleTypeName.includes("elf")) {
      totalPrice = calculateElfPrice(distanceKm, vehicleCount);
    } else {
      // Fallback to a default calculation for unknown vehicle types
      const defaultRate = 6000;
      totalPrice = defaultRate * distanceKm * vehicleCount;
    }

    return NextResponse.json({
      message: "Price calculated successfully",
      data: {
        vehicleType: vehicleType.name,
        distanceKm,
        vehicleCount,
        totalPrice: Math.round(totalPrice), // Round to whole number
      },
    });
  } catch (error) {
    console.error("Error calculating price:", error);
    return NextResponse.json(
      { message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
}
