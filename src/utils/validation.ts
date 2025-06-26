// ✅ Distance and Price Validation Utilities
// Prevents extreme calculations and provides better error handling

// ✅ NEW: Area definitions for vehicle pickup validation
export const AREA_CENTERS = {
  MALANG: [
    {
      name: "Kota Malang",
      lat: -7.983908,
      lng: 112.621391,
      radius: 15000, // 15 km radius untuk Kota Malang (Angkot & ELF)
    },
    {
      name: "Kabupaten Malang",
      lat: -8.16667,
      lng: 112.66667,
      radius: 50000, // 50 km radius untuk Kabupaten Malang (Angkot & ELF - area lebih luas)
    },
  ],
  MALANG_HIACE: [
    {
      name: "Pusat Kota Malang",
      lat: -7.983908,
      lng: 112.621391,
      radius: 8000, // 8 km radius - hanya pusat kota Malang untuk Hiace
    },
  ],
  SURABAYA: [
    {
      name: "Kota Surabaya",
      lat: -7.250445,
      lng: 112.768845,
      radius: 20000, // 20 km radius untuk Kota Surabaya (tidak digunakan untuk Hiace)
    },
  ],
  SURABAYA_HIACE: [
    {
      name: "Pusat Kota Surabaya",
      lat: -7.250445,
      lng: 112.768845,
      radius: 8000, // 8 km radius - hanya pusat kota Surabaya untuk Hiace
    },
  ],
} as const;

// ✅ NEW: Vehicle pickup area restrictions
export const VEHICLE_PICKUP_RESTRICTIONS = {
  ANGKOT: ["MALANG"],
  ELF: ["MALANG"],
  HIACE_PREMIO: ["MALANG_HIACE", "SURABAYA_HIACE"],
  HIACE_COMMUTER: ["MALANG_HIACE", "SURABAYA_HIACE"],
} as const;

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
  details: Record<string, unknown>,
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

/**
 * ✅ NEW: Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

/**
 * ✅ NEW: Check if coordinates are within specific area
 */
function isWithinArea(
  lat: number,
  lng: number,
  centers: ReadonlyArray<{
    readonly lat: number;
    readonly lng: number;
    readonly radius: number;
    readonly name?: string;
  }>
): boolean {
  for (const center of centers) {
    const distance = calculateDistance(lat, lng, center.lat, center.lng);
    if (distance <= center.radius) {
      return true;
    }
  }
  return false;
}

/**
 * ✅ NEW: Validate pickup location based on vehicle type
 * This function validates ONLY pickup locations (first destination of first trip)
 */
export function validatePickupLocation(
  lat: number,
  lng: number,
  vehicleName: string
): {
  isValid: boolean;
  message?: string;
  allowedAreas?: readonly string[];
} {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return {
      isValid: false,
      message: "Koordinat lokasi tidak valid",
    };
  }

  const vehicleType = vehicleName.toLowerCase();
  let allowedAreas: readonly string[] = [];
  let vehicleDisplayName = vehicleName;

  // Determine allowed areas based on vehicle type
  if (vehicleType.includes("angkot")) {
    allowedAreas = VEHICLE_PICKUP_RESTRICTIONS.ANGKOT;
    vehicleDisplayName = "Angkot";
  } else if (vehicleType.includes("elf")) {
    allowedAreas = VEHICLE_PICKUP_RESTRICTIONS.ELF;
    vehicleDisplayName = "ELF";
  } else if (vehicleType.includes("hiace")) {
    allowedAreas = VEHICLE_PICKUP_RESTRICTIONS.HIACE_PREMIO; // Same for both Premio & Commuter
    vehicleDisplayName = "Hiace";
  } else {
    // For unknown vehicle types, default to most restrictive (Malang only)
    // This prevents bypassing validation when vehicleName is empty or unknown
    allowedAreas = VEHICLE_PICKUP_RESTRICTIONS.ANGKOT; // Most restrictive: Malang only
    vehicleDisplayName = "Kendaraan";

    console.warn(
      `Unknown vehicle type: "${vehicleName}". Defaulting to Malang-only restriction.`
    );
  }

  // Check if pickup location is within any allowed area
  for (const areaName of allowedAreas) {
    const areaCenters = AREA_CENTERS[areaName as keyof typeof AREA_CENTERS];
    if (areaCenters && isWithinArea(lat, lng, areaCenters)) {
      return { isValid: true };
    }
  }

  // If not within any allowed area, return error
  const areaList = allowedAreas.join(" dan ");
  return {
    isValid: false,
    message: `❌ ${vehicleDisplayName} hanya tersedia untuk penjemputan di area ${areaList}`,
    allowedAreas,
  };
}

/**
 * ✅ NEW: Get allowed areas for vehicle type (for frontend autocomplete bounds)
 */
export function getAllowedAreasForVehicle(vehicleName: string): string[] {
  const vehicleType = vehicleName.toLowerCase();

  if (vehicleType.includes("angkot")) {
    return [...VEHICLE_PICKUP_RESTRICTIONS.ANGKOT];
  } else if (vehicleType.includes("elf")) {
    return [...VEHICLE_PICKUP_RESTRICTIONS.ELF];
  } else if (vehicleType.includes("hiace")) {
    return [...VEHICLE_PICKUP_RESTRICTIONS.HIACE_PREMIO];
  }

  // Default to Malang for unknown vehicle types
  return ["MALANG"];
}

/**
 * ✅ NEW: Validate any destination for Angkot (all destinations must be in Malang)
 * This is different from pickup location validation - Angkot has restriction on ALL destinations
 */
export function validateAngkotDestination(
  lat: number,
  lng: number
): {
  isValid: boolean;
  message?: string;
  allowedAreas?: string[];
} {
  // Check if coordinates are within any allowed area for Angkot
  const allowedAreas = [...VEHICLE_PICKUP_RESTRICTIONS.ANGKOT];
  const isValidLocation = allowedAreas.some((area) => {
    const centers = AREA_CENTERS[area as keyof typeof AREA_CENTERS];
    return centers.some((center) => {
      const distance = calculateDistance(lat, lng, center.lat, center.lng);
      return distance <= center.radius;
    });
  });

  if (!isValidLocation) {
    return {
      isValid: false,
      message: `Angkot hanya melayani area ${allowedAreas.join(", ")}`,
      allowedAreas,
    };
  }

  return {
    isValid: true,
    allowedAreas,
  };
}

/**
 * ✅ NEW: Check if vehicle type requires all destinations to be restricted (like Angkot)
 */
export function requiresAllDestinationRestriction(
  vehicleName: string
): boolean {
  const vehicleType = vehicleName.toLowerCase();
  return vehicleType.includes("angkot");
}
