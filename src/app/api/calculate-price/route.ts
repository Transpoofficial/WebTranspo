import { prisma } from "@/lib/prisma";
import { calculateTotalPrice, calculateDistance } from "@/utils/order";
import { NextRequest, NextResponse } from "next/server";

// Define proper types for trip data
interface TripLocation {
  lat: number | null;
  lng: number | null;
  address: string;
  time?: string | null;
}

export interface Trip {
  date: string | Date; // Allow both string and Date
  location: TripLocation[];
  distance?: number;
  duration?: number;
  startTime?: string;
}

interface PriceCalculationRequest {
  vehicleTypeId: string;
  vehicleCount?: number;
  trips: Trip[];
}

interface PriceCalculationResponse {
  vehicleType: string;
  totalDistanceKm: number;
  vehicleCount: number;
  basePrice: number;
  interTripCharges: number;
  totalPrice: number;
  breakdown: {
    tripDistances: Array<{
      date: string;
      distance: number;
    }>;
    interTripDetails: Array<{
      from: string;
      to: string;
      distance: number;
      charge: number;
    }>;
  };
}

// Helper function to safely format date
const formatDateString = (date: string | Date): string => {
  if (typeof date === "string") {
    // If it's already a string, try to parse it
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      // If parsing fails, assume it's already in YYYY-MM-DD format
      return date.split("T")[0];
    }
    return parsedDate.toISOString().split("T")[0];
  } else if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  } else {
    // Fallback
    return new Date().toISOString().split("T")[0];
  }
};

// Calculate route distance using the same logic as backend
const calculateRouteDistance = (
  locations: Array<{ lat: number; lng: number }>
): number => {
  if (locations.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < locations.length - 1; i++) {
    const distance = calculateDistance(
      locations[i].lat,
      locations[i].lng,
      locations[i + 1].lat,
      locations[i + 1].lng
    );
    totalDistance += distance;
  }

  return totalDistance; // Return in kilometers
};

export async function POST(req: NextRequest) {
  try {
    const body: PriceCalculationRequest = await req.json();
    const { vehicleTypeId, vehicleCount = 1, trips = [] } = body;

    console.log("Price calculation request:", {
      vehicleTypeId,
      vehicleCount,
      tripsCount: trips.length,
      tripDates: trips.map((t) => ({ date: t.date, type: typeof t.date })),
    });

    if (!vehicleTypeId || !trips.length) {
      return NextResponse.json(
        {
          message: "Missing required fields: vehicleTypeId and trips required",
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

    // Calculate distance for each trip and total distance
    let totalDistanceKm = 0;
    const tripDistances: Array<{ date: string; distance: number }> = [];

    const processedTrips = trips.map((trip) => {
      // Filter valid locations
      const validLocations = trip.location.filter(
        (loc) => loc.lat !== null && loc.lng !== null && loc.address
      );

      const tripDateString = formatDateString(trip.date);

      if (validLocations.length < 2) {
        tripDistances.push({
          date: tripDateString,
          distance: 0,
        });

        return {
          date: new Date(tripDateString),
          location: validLocations,
          distance: 0,
        };
      }

      // Calculate distance for this trip
      const locations = validLocations.map((loc) => ({
        lat: loc.lat!,
        lng: loc.lng!,
      }));

      const tripDistance = calculateRouteDistance(locations);
      totalDistanceKm += tripDistance;

      tripDistances.push({
        date: tripDateString,
        distance: tripDistance,
      });

      return {
        date: new Date(tripDateString),
        location: validLocations,
        distance: tripDistance,
      };
    });

    console.log(`Total calculated distance: ${totalDistanceKm.toFixed(2)} km`);

    // Use the same calculateTotalPrice function as the orders endpoint
    const priceResult = calculateTotalPrice(
      vehicleType.name,
      totalDistanceKm,
      vehicleCount,
      processedTrips
    );

    // Calculate inter-trip additional charges with detailed breakdown for response
    const interTripDetails: Array<{
      from: string;
      to: string;
      distance: number;
      charge: number;
    }> = [];

    if (processedTrips.length > 1) {
      // Sort trips by date to ensure correct order
      const sortedTrips = processedTrips.sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      });

      for (let i = 0; i < sortedTrips.length - 1; i++) {
        const currentTrip = sortedTrips[i];
        const nextTrip = sortedTrips[i + 1];

        if (currentTrip.location.length > 0 && nextTrip.location.length > 0) {
          const lastLocationCurrent =
            currentTrip.location[currentTrip.location.length - 1];
          const firstLocationNext = nextTrip.location[0];

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

            let charge = 0;
            if (distance > 50) {
              const excessDistance = distance - 50;
              const brackets = Math.ceil(excessDistance / 10);
              charge = brackets * 50000;
            }

            interTripDetails.push({
              from: lastLocationCurrent.address || "Lokasi tidak diketahui",
              to: firstLocationNext.address || "Lokasi tidak diketahui",
              distance: Math.round(distance * 10) / 10,
              charge,
            });

            console.log(`Inter-trip ${i} to ${i + 1}:`, {
              from: lastLocationCurrent.address?.split(",")[0],
              to: firstLocationNext.address?.split(",")[0],
              distance: Math.round(distance * 10) / 10,
              charge: charge,
            });
          }
        }
      }
    }

    console.log("Price calculation result:", {
      vehicleType: vehicleType.name,
      distanceKm: totalDistanceKm.toFixed(2),
      vehicleCount,
      basePrice: priceResult.basePrice,
      interTripCharges: priceResult.interTripCharges,
      totalPrice: priceResult.totalPrice,
    });

    const responseData: PriceCalculationResponse = {
      vehicleType: vehicleType.name,
      totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
      vehicleCount,
      basePrice: priceResult.basePrice,
      interTripCharges: priceResult.interTripCharges,
      totalPrice: priceResult.totalPrice,
      breakdown: {
        tripDistances,
        interTripDetails,
      },
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
