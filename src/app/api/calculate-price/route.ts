import { prisma } from "@/lib/prisma";
import { calculateTotalPrice, calculateDistance } from "@/utils/order";
import {
  calculateRouteDistanceWithDirectionsAPI,
  calculateInterTripDistance,
} from "@/utils/google-maps";
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
  elfOutOfMalangCharges?: number;
  totalPrice: number;
  tripBreakdown?: Array<{
    date: string;
    distance: number;
    pricePerTrip: number;
  }>;
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

// Calculate route distance using Google Maps Directions API (same as frontend)
const calculateRouteDistance = async (
  locations: Array<{ lat: number; lng: number }>
): Promise<number> => {
  if (locations.length < 2) return 0;

  try {
    // Use same Directions API as frontend for consistency
    const result = await calculateRouteDistanceWithDirectionsAPI(locations);
    return result.distance / 1000; // Convert meters to kilometers
  } catch (error) {
    console.error(
      "Error calculating route distance with Directions API:",
      error
    );

    // Fallback to Haversine formula
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
  }
};

export async function POST(req: NextRequest) {
  try {
    const body: PriceCalculationRequest = await req.json();
    const { vehicleTypeId, vehicleCount = 1, trips = [] } = body;

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
    const processedTrips = await Promise.all(
      trips.map(async (trip) => {
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

        // Use frontend-calculated distance if available (already in meters)
        let tripDistance = 0;
        if (trip.distance && trip.distance > 0) {
          tripDistance = trip.distance / 1000; // Convert meters to kilometers
        } else {
          // Fallback: Calculate distance using Google Maps API
          const locations = validLocations.map((loc) => ({
            lat: loc.lat!,
            lng: loc.lng!,
          }));
          tripDistance = await calculateRouteDistance(locations);
        }

        totalDistanceKm += tripDistance;

        tripDistances.push({
          date: tripDateString,
          distance: tripDistance,
        });

        return {
          date: new Date(tripDateString),
          location: validLocations,
          distance: tripDistance * 1000, // Convert to meters for consistency with Trip interface
        };
      })
    );

    // ✅ NEW: Use the updated calculateTotalPrice function with per-trip mechanism
    // Note: totalDistanceKm parameter is no longer used in the new calculation,
    // but kept for backward compatibility
    const priceResult = calculateTotalPrice(
      vehicleType.name,
      totalDistanceKm, // This parameter is now ignored in favor of individual trip distances
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
            // Use Haversine formula for inter-trip distance (as specified)
            const distance = calculateInterTripDistance(
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
          }
        }
      }
    }
    const responseData: PriceCalculationResponse = {
      vehicleType: vehicleType.name,
      totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
      vehicleCount,
      basePrice: priceResult.basePrice,
      interTripCharges: priceResult.interTripCharges,
      elfOutOfMalangCharges: priceResult.elfOutOfMalangCharges || 0,
      totalPrice: priceResult.totalPrice,
      tripBreakdown: priceResult.tripBreakdown,
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
