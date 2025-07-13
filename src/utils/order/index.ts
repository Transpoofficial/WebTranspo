import { calculateInterTripDistance } from "../google-maps";
import {
  validateDistance as validateDistanceUtil,
  logValidationError,
  calculateElfOutOfMalangCharges,
} from "../validation";

// Define Trip interface locally instead of importing from route
export interface Trip {
  date: Date;
  location: Array<{
    lat: number | null;
    lng: number | null;
    address: string;
    time?: string | null;
  }>;
  distance?: number;
  duration?: number;
  startTime?: string;
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
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
export function calculateInterTripCharges(trips: Trip[]): number {
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
        const distance = calculateInterTripDistance(
          lastLocationCurrent.lat,
          lastLocationCurrent.lng,
          firstLocationNext.lat,
          firstLocationNext.lng
        );

        if (distance > 50) {
          // Calculate additional charge based on distance brackets
          const excessDistance = distance - 50;
          const brackets = Math.ceil(excessDistance / 10);
          const charge = brackets * 50000;

          totalAdditionalCharge += charge;
        }
      }
    }
  }

  return totalAdditionalCharge;
}

// ✅ Distance validation and safety limits
export const MAX_REASONABLE_DISTANCE_KM = 2000; // Maximum reasonable distance in Indonesia
export const MAX_SINGLE_TRIP_DISTANCE_KM = 1000; // Maximum for single trip

// ✅ Enhanced validation for distance calculations
export function validateDistance(distanceKm: number): boolean {
  const validation = validateDistanceUtil(distanceKm);

  if (!validation.isValid) {
    logValidationError(
      "distance",
      {
        distanceKm,
        message: validation.message,
      },
      "order_calculation"
    );
  }

  return validation.isValid;
}

// ✅ Enhanced price calculation functions with validation - NEW: Per trip calculation
export function calculateAngkotPrice(distanceKm: number): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Angkot: ${distanceKm}km`);
    return 0;
  }

  // Angkot should not be used for very long distances
  if (distanceKm > 200) {
    console.warn(
      `Angkot distance too long: ${distanceKm}km. Consider other vehicles.`
    );
  }

  // NEW formula: (150.000 + (4100 × Jarak)) × 1.2 (per trip, not multiplied by vehicle count here)
  const basePrice = 150000 + 4100 * distanceKm;
  const priceWithTax = basePrice * 1.2; // Add 20%

  return Math.round(priceWithTax);
}

// ✅ NEW: Calculate price for single trip/day for Angkot
export function calculateAngkotPricePerTrip(distanceKm: number): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Angkot: ${distanceKm}km`);
    return 0;
  }

  // Angkot should not be used for very long distances
  if (distanceKm > 200) {
    console.warn(
      `Angkot distance too long: ${distanceKm}km. Consider other vehicles.`
    );
  }

  // Formula per trip: (150.000 + (4100 × Jarak)) × 1.2
  const basePrice = 150000 + 4100 * distanceKm;
  const priceWithTax = basePrice * 1.2; // Add 20%

  return Math.round(priceWithTax);
}

export function calculateHiaceCommuterPrice(distanceKm: number): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Hiace Commuter: ${distanceKm}km`);
    return 0;
  }

  // NEW formula: (1.000.000 + (2500 × Jarak)) × 1.1 (per trip, not multiplied by vehicle count here)
  const basePrice = 1000000 + 2500 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10%

  return Math.round(priceWithTax);
}

// ✅ NEW: Calculate price for single trip/day for Hiace Commuter
export function calculateHiaceCommuterPricePerTrip(distanceKm: number): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Hiace Commuter: ${distanceKm}km`);
    return 0;
  }

  // Formula per trip: (1.000.000 + (2500 × Jarak)) × 1.1
  const basePrice = 1000000 + 2500 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10%

  return Math.round(priceWithTax);
}

export function calculateHiacePremioPrice(distanceKm: number): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Hiace Premio: ${distanceKm}km`);
    return 0;
  }

  // NEW formula: (1,150,000 + (2500 × Jarak KM)) × 1.1 (per trip, not multiplied by vehicle count here)
  const basePrice = 1150000 + 2500 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10% PPN

  return Math.round(priceWithTax);
}

// ✅ NEW: Calculate price for single trip/day for Hiace Premio
export function calculateHiacePremioPricePerTrip(distanceKm: number): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Hiace Premio: ${distanceKm}km`);
    return 0;
  }

  // Formula per trip: (1,150,000 + (2500 × Jarak KM)) × 1.1
  const basePrice = 1150000 + 2500 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10% PPN

  return Math.round(priceWithTax);
}

export function calculateElfPrice(distanceKm: number): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Elf: ${distanceKm}km`);
    return 0;
  }

  // NEW formula: (1.250.000 + (2500 × Jarak)) × 1.1 (per trip, not multiplied by vehicle count here)
  const basePrice = 1250000 + 2500 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10%

  return Math.round(priceWithTax);
}

// ✅ NEW: Calculate price for single trip/day for ELF
export function calculateElfPricePerTrip(distanceKm: number): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Elf: ${distanceKm}km`);
    return 0;
  }

  // NEW formula: (1.250.000 + (2500 × Jarak)) × 1.1 (per trip, not multiplied by vehicle count here)
  const basePrice = 1250000 + 2500 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10%

  return Math.round(priceWithTax);
}

// ✅ Main price calculation function with NEW per-trip mechanism
export function calculateTotalPrice(
  vehicleTypeName: string,
  distanceKm: number,
  vehicleCount: number,
  trips: Trip[]
): {
  basePrice: number;
  interTripCharges: number;
  elfOutOfMalangCharges: number;
  totalPrice: number;
  tripBreakdown?: Array<{
    date: string;
    distance: number;
    pricePerTrip: number;
  }>;
} {
  const vehicleType = vehicleTypeName.toLowerCase();
  let totalBasePriceAllTrips = 0;
  const tripBreakdown: Array<{
    date: string;
    distance: number;
    pricePerTrip: number;
  }> = [];

  // ✅ NEW: Calculate price per trip individually, then sum them up
  for (const trip of trips) {
    // Calculate distance for this specific trip
    let tripDistanceKm = 0;

    // If trip has distance data, use it (convert from meters to km)
    if (trip.distance && trip.distance > 0) {
      tripDistanceKm = trip.distance / 1000;
    } else {
      // Fallback: calculate from locations if no distance data
      if (trip.location && trip.location.length >= 2) {
        let tripDistanceMeters = 0;
        for (let i = 0; i < trip.location.length - 1; i++) {
          const currentLoc = trip.location[i];
          const nextLoc = trip.location[i + 1];

          if (
            currentLoc.lat !== null &&
            currentLoc.lng !== null &&
            nextLoc.lat !== null &&
            nextLoc.lng !== null
          ) {
            const segmentDistance = calculateDistance(
              currentLoc.lat,
              currentLoc.lng,
              nextLoc.lat,
              nextLoc.lng
            );
            tripDistanceMeters += segmentDistance * 1000; // Convert km to meters
          }
        }
        tripDistanceKm = tripDistanceMeters / 1000; // Convert back to km
      }
    }

    // Calculate price for this trip based on vehicle type
    let tripPrice = 0;
    if (vehicleType.includes("angkot")) {
      tripPrice = calculateAngkotPricePerTrip(tripDistanceKm);
    } else if (
      vehicleType.includes("hiace") &&
      vehicleType.includes("commuter")
    ) {
      tripPrice = calculateHiaceCommuterPricePerTrip(tripDistanceKm);
    } else if (
      vehicleType.includes("hiace") &&
      vehicleType.includes("premio")
    ) {
      tripPrice = calculateHiacePremioPricePerTrip(tripDistanceKm);
    } else if (vehicleType.includes("elf")) {
      tripPrice = calculateElfPricePerTrip(tripDistanceKm);
    } else {
      // Fallback calculation per trip
      const defaultRate = 6000;
      tripPrice = Math.round(defaultRate * tripDistanceKm);
    }

    totalBasePriceAllTrips += tripPrice;

    // Add to breakdown for detailed display
    tripBreakdown.push({
      date: trip.date.toISOString().split("T")[0],
      distance: tripDistanceKm,
      pricePerTrip: tripPrice,
    });
  }

  // ✅ NEW: Multiply total of all trips by vehicle count
  const totalBasePrice = totalBasePriceAllTrips * vehicleCount;

  // Calculate inter-trip charges (NOT multiplied by vehicle count)
  const interTripCharges = calculateInterTripCharges(trips);

  // ✅ Calculate ELF out-of-Malang charges (NOT multiplied by vehicle count)
  const elfChargeData = calculateElfOutOfMalangCharges(
    trips.map((trip) => ({
      date: trip.date.toISOString().split("T")[0], // Convert Date to string
      destinations: trip.location.map((loc) => ({
        lat: loc.lat || 0,
        lng: loc.lng || 0,
        address: loc.address,
      })),
    })),
    vehicleTypeName
  );
  const elfOutOfMalangCharges = elfChargeData.totalCharge;

  // Calculate total price
  const totalPrice = totalBasePrice + interTripCharges + elfOutOfMalangCharges;

  return {
    basePrice: Math.round(totalBasePrice),
    interTripCharges: Math.round(interTripCharges),
    elfOutOfMalangCharges: Math.round(elfOutOfMalangCharges),
    totalPrice: Math.round(totalPrice),
    tripBreakdown,
  };
}
