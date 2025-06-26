import { calculateInterTripDistance } from "../google-maps";
import {
  validateDistance as validateDistanceUtil,
  logValidationError,
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

// ✅ Enhanced price calculation functions with validation
export function calculateAngkotPrice(
  distanceKm: number,
  vehicleCount: number
): number {
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

  // New formula: (150.000 + (4100 × Jarak)) + 20% (updated from 10%)
  const basePrice = 150000 + 4100 * distanceKm;
  const priceWithTax = basePrice * 1.2; // Add 20% (changed from 10%)
  const totalPrice = priceWithTax * vehicleCount;

  return Math.round(totalPrice);
}

export function calculateHiaceCommuterPrice(
  distanceKm: number,
  vehicleCount: number
): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Hiace Commuter: ${distanceKm}km`);
    return 0;
  }

  // New formula: (1.000.000 + (2500 × Jarak)) + 10%
  const basePrice = 1000000 + 2500 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10%
  const totalPrice = priceWithTax * vehicleCount;

  return Math.round(totalPrice);
}

export function calculateHiacePremioPrice(
  distanceKm: number,
  vehicleCount: number
): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Hiace Premio: ${distanceKm}km`);
    return 0;
  }

  // Original formula as specified: 1,150,000 + (25,000 × Jarak KM) + PPN 10%
  const basePrice = 1150000 + 25000 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10% PPN
  const totalPrice = priceWithTax * vehicleCount;

  return Math.round(totalPrice);
}

export function calculateElfPrice(
  distanceKm: number,
  vehicleCount: number
): number {
  // Validate distance
  if (!validateDistance(distanceKm)) {
    console.warn(`Invalid distance for Elf: ${distanceKm}km`);
    return 0;
  }

  // New formula: (1.250.000 + (2500 × Jarak)) + 10%
  const basePrice = 1250000 + 2500 * distanceKm;
  const priceWithTax = basePrice * 1.1; // Add 10%
  const totalPrice = priceWithTax * vehicleCount;

  return Math.round(totalPrice);
}

// ✅ Main price calculation function for consistency
export function calculateTotalPrice(
  vehicleTypeName: string,
  distanceKm: number,
  vehicleCount: number,
  trips: Trip[]
): {
  basePrice: number;
  interTripCharges: number;
  totalPrice: number;
} {
  const vehicleType = vehicleTypeName.toLowerCase();
  let basePrice = 0;

  // Calculate base price based on vehicle type
  if (vehicleType.includes("angkot")) {
    basePrice = calculateAngkotPrice(distanceKm, vehicleCount);
  } else if (
    vehicleType.includes("hiace") &&
    vehicleType.includes("commuter")
  ) {
    basePrice = calculateHiaceCommuterPrice(distanceKm, vehicleCount);
  } else if (vehicleType.includes("hiace") && vehicleType.includes("premio")) {
    basePrice = calculateHiacePremioPrice(distanceKm, vehicleCount);
  } else if (vehicleType.includes("elf")) {
    basePrice = calculateElfPrice(distanceKm, vehicleCount);
  } else {
    // Fallback calculation
    const defaultRate = 6000;
    basePrice = Math.round(defaultRate * distanceKm * vehicleCount);
  }

  // Calculate inter-trip charges
  const interTripCharges = calculateInterTripCharges(trips);

  // Calculate total price
  const totalPrice = basePrice + interTripCharges;

  return {
    basePrice: Math.round(basePrice),
    interTripCharges: Math.round(interTripCharges),
    totalPrice: Math.round(totalPrice),
  };
}
