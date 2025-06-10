import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Define proper types for trip data
interface TripLocation {
  lat: number | null;
  lng: number | null;
  address: string;
  time?: string | null;
}

interface Trip {
  date: Date;
  location: TripLocation[];
  distance?: number;
  duration?: number;
  startTime?: string;
}

interface PriceCalculationRequest {
  vehicleTypeId: string;
  totalDistance: number;
  vehicleCount?: number;
  trips?: Trip[];
}

interface PriceCalculationResponse {
  vehicleType: string;
  distanceKm: number;
  vehicleCount: number;
  basePrice: number;
  interTripCharges: number;
  totalPrice: number;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Calculate inter-trip additional charges with proper typing
function calculateInterTripCharges(trips: Trip[]): number {
  if (!trips || trips.length <= 1) return 0;

  let totalAdditionalCharge = 0;

  for (let i = 0; i < trips.length - 1; i++) {
    const currentTrip = trips[i];
    const nextTrip = trips[i + 1];

    // Get last location of current trip and first location of next trip
    if (
      currentTrip.location &&
      nextTrip.location &&
      currentTrip.location.length > 0 &&
      nextTrip.location.length > 0
    ) {
      const lastLocationCurrent =
        currentTrip.location[currentTrip.location.length - 1];
      const firstLocationNext = nextTrip.location[0];

      // Type guard to ensure we have valid coordinates
      if (
        lastLocationCurrent.lat !== null &&
        lastLocationCurrent.lng !== null &&
        firstLocationNext.lat !== null &&
        firstLocationNext.lng !== null
      ) {
        const distance = calculateDistance(
          lastLocationCurrent.lat,
          lastLocationCurrent.lng,
          firstLocationNext.lat,
          firstLocationNext.lng
        );

        console.log(
          `Inter-trip distance ${i + 1} to ${i + 2}: ${distance.toFixed(2)} km`
        );

        if (distance > 50) {
          // Calculate additional charge based on distance brackets
          const excessDistance = distance - 50;
          const brackets = Math.ceil(excessDistance / 10);
          const charge = brackets * 50000;

          console.log(
            `Additional charge for ${distance.toFixed(
              2
            )} km: Rp ${charge.toLocaleString()}`
          );
          totalAdditionalCharge += charge;
        }
      }
    }
  }

  console.log(
    `Total additional inter-trip charges: Rp ${totalAdditionalCharge.toLocaleString()}`
  );
  return totalAdditionalCharge;
}

// Price calculation functions for each vehicle type
function calculateAngkotPrice(
  distanceKm: number,
  vehicleCount: number
): number {
  // Placeholder formula for Angkot
  // Base rate: 5000 per km, minimum charge of 100,000
  const baseRate = 5000;
  const minCharge = 100000;

  const price = baseRate * distanceKm * vehicleCount;
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

  const price = baseRate * distanceKm * vehicleCount;
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

  const price = baseRate * distanceKm * vehicleCount;
  return price < minCharge ? minCharge : price;
}

function calculateElfPrice(distanceKm: number, vehicleCount: number): number {
  // Placeholder formula for Elf
  // Base rate: 8000 per km, minimum charge of 180,000
  const baseRate = 8000;
  const minCharge = 180000;

  const price = baseRate * distanceKm * vehicleCount;
  return price < minCharge ? minCharge : price;
}

export async function POST(req: NextRequest) {
  try {
    const body: PriceCalculationRequest = await req.json();
    const { vehicleTypeId, totalDistance, vehicleCount = 1, trips = [] } = body;

    console.log("Price calculation request:", {
      vehicleTypeId,
      totalDistance,
      vehicleCount,
      tripsCount: trips.length,
    });

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
    let basePrice = 0;

    // Calculate base price based on vehicle type
    const vehicleTypeName = vehicleType.name.toLowerCase();

    if (vehicleTypeName.includes("angkot")) {
      basePrice = calculateAngkotPrice(distanceKm, vehicleCount);
    } else if (
      vehicleTypeName.includes("hiace") &&
      vehicleTypeName.includes("commuter")
    ) {
      basePrice = calculateHiaceCommuterPrice(distanceKm, vehicleCount);
    } else if (
      vehicleTypeName.includes("hiace") &&
      vehicleTypeName.includes("premio")
    ) {
      basePrice = calculateHiacePremioPrice(distanceKm, vehicleCount);
    } else if (vehicleTypeName.includes("elf")) {
      basePrice = calculateElfPrice(distanceKm, vehicleCount);
    } else {
      // Fallback to a default calculation for unknown vehicle types
      const defaultRate = 6000;
      basePrice = defaultRate * distanceKm * vehicleCount;
    }

    // Calculate inter-trip additional charges
    const interTripCharges = calculateInterTripCharges(trips);

    // Calculate final total price
    const totalPrice = basePrice + interTripCharges;

    console.log("Price calculation result:", {
      basePrice,
      interTripCharges,
      totalPrice,
      distanceKm: distanceKm.toFixed(2),
    });

    const responseData: PriceCalculationResponse = {
      vehicleType: vehicleType.name,
      distanceKm,
      vehicleCount,
      basePrice: Math.round(basePrice),
      interTripCharges: Math.round(interTripCharges),
      totalPrice: Math.round(totalPrice), // Round to whole number
    };

    return NextResponse.json({
      message: "Price calculated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error calculating price:", error);
    return NextResponse.json(
      { message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
}
