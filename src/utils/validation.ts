// ✅ Distance and Price Validation Utilities
// Prevents extreme calculations and provides better error handling

export const VALIDATION_LIMITS = {
  MAX_REASONABLE_DISTANCE_KM: 2000, // Maximum reasonable distance in Indonesia
  MAX_SINGLE_TRIP_DISTANCE_KM: 1000, // Maximum for single trip
  MAX_INTER_TRIP_DISTANCE_KM: 500, // Maximum inter-trip distance
  MIN_DISTANCE_KM: 0.1, // Minimum meaningful distance

  // Price limits (in IDR)
  MAX_REASONABLE_PRICE: 100_000_000, // 100 million IDR
  MIN_REASONABLE_PRICE: 50_000, // 50 thousand IDR
} as const;

export const DISTANCE_VALIDATION_MESSAGES = {
  TOO_LONG: "Jarak terlalu jauh. Maksimal 2000km untuk satu pesanan.",
  TOO_SHORT:
    "Jarak terlalu pendek. Minimal 100m untuk perhitungan yang akurat.",
  INVALID: "Koordinat tidak valid atau tidak dapat dihitung jaraknya.",
  EXTREME:
    "Jarak ekstrem terdeteksi. Silakan periksa kembali lokasi yang dipilih.",
} as const;

/**
 * Validate if distance is within reasonable limits
 */
export function validateDistance(distanceKm: number): {
  isValid: boolean;
  message?: string;
  suggestion?: string;
} {
  if (isNaN(distanceKm) || distanceKm < 0) {
    return {
      isValid: false,
      message: DISTANCE_VALIDATION_MESSAGES.INVALID,
      suggestion: "Periksa kembali lokasi yang dipilih",
    };
  }

  if (distanceKm < VALIDATION_LIMITS.MIN_DISTANCE_KM) {
    return {
      isValid: false,
      message: DISTANCE_VALIDATION_MESSAGES.TOO_SHORT,
      suggestion: "Pilih lokasi yang lebih jauh atau gunakan transportasi lain",
    };
  }

  if (distanceKm > VALIDATION_LIMITS.MAX_REASONABLE_DISTANCE_KM) {
    return {
      isValid: false,
      message: DISTANCE_VALIDATION_MESSAGES.TOO_LONG,
      suggestion: "Bagi perjalanan menjadi beberapa pesanan terpisah",
    };
  }

  return { isValid: true };
}

/**
 * Validate if price is within reasonable limits
 */
export function validatePrice(
  price: number,
  vehicleType: string
): {
  isValid: boolean;
  message?: string;
  suggestion?: string;
} {
  if (isNaN(price) || price < 0) {
    return {
      isValid: false,
      message: "Harga tidak valid",
      suggestion: "Silakan refresh halaman dan coba lagi",
    };
  }

  if (price < VALIDATION_LIMITS.MIN_REASONABLE_PRICE) {
    return {
      isValid: false,
      message: "Harga terlalu rendah",
      suggestion: "Periksa kembali perhitungan jarak dan kendaraan",
    };
  }

  if (price > VALIDATION_LIMITS.MAX_REASONABLE_PRICE) {
    return {
      isValid: false,
      message: `Harga terlalu tinggi untuk ${vehicleType}`,
      suggestion:
        "Periksa jarak perjalanan atau pilih kendaraan yang lebih sesuai",
    };
  }

  return { isValid: true };
}

/**
 * Check if coordinates are within Indonesia bounds
 */
export function validateIndonesiaCoordinates(
  lat: number,
  lng: number
): boolean {
  // Indonesia approximate bounds
  const INDONESIA_BOUNDS = {
    north: 6.0, // Northern Sumatra
    south: -11.0, // Southern Java/Nusa Tenggara
    east: 141.0, // Eastern Papua
    west: 95.0, // Western Sumatra
  };

  return (
    lat >= INDONESIA_BOUNDS.south &&
    lat <= INDONESIA_BOUNDS.north &&
    lng >= INDONESIA_BOUNDS.west &&
    lng <= INDONESIA_BOUNDS.east
  );
}

/**
 * Enhanced logging for validation errors
 */
export function logValidationError(
  type: "distance" | "price" | "coordinates",
  details: any,
  context?: string
) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    type,
    context: context || "unknown",
    details,
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : "server",
  };

  console.error(`Validation Error [${type}]:`, logData);

  // In production, you might want to send this to a logging service
  // analytics.track('validation_error', logData);
}
