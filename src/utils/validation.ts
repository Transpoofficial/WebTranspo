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

// ✅ NEW: ELF Special Charges
export const ELF_CHARGES = {
  OUT_OF_MALANG_PER_TRIP: 100_000, // 100k IDR per trip/day if trip has destinations outside Malang
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

/**
 * ✅ NEW: Check if coordinates are within Malang area (for ELF out-of-Malang charge calculation)
 */
export function isWithinMalangArea(lat: number, lng: number): boolean {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return false;
  }

  const malangCenters = AREA_CENTERS.MALANG;
  return isWithinArea(lat, lng, malangCenters);
}

/**
 * ✅ NEW: Calculate ELF out-of-Malang charges per trip
 * ELF gets charged 100k IDR per trip/day if that trip has any destination outside Malang area
 */
export function calculateElfOutOfMalangCharges(
  trips: Array<{
    date: string;
    destinations: Array<{
      lat: number;
      lng: number;
      address: string;
    }>;
  }>,
  vehicleName: string
): {
  totalCharge: number;
  chargedTrips: number;
  tripDetails: Array<{
    date: string;
    hasOutOfMalangDestination: boolean;
    charge: number;
    outOfMalangDestinations: string[];
  }>;
} {
  // Only apply to ELF vehicles
  const vehicleType = vehicleName.toLowerCase();
  if (!vehicleType.includes("elf")) {
    return {
      totalCharge: 0,
      chargedTrips: 0,
      tripDetails: [],
    };
  }

  let totalCharge = 0;
  let chargedTrips = 0;
  const tripDetails = trips.map((trip) => {
    const outOfMalangDestinations: string[] = [];
    let hasOutOfMalangDestination = false;

    // Check each destination in this trip
    trip.destinations.forEach((destination) => {
      const isInMalang = isWithinMalangArea(destination.lat, destination.lng);
      if (!isInMalang) {
        hasOutOfMalangDestination = true;
        outOfMalangDestinations.push(destination.address);
      }
    });

    // Apply charge if trip has any destination outside Malang
    const charge = hasOutOfMalangDestination
      ? ELF_CHARGES.OUT_OF_MALANG_PER_TRIP
      : 0;
    if (charge > 0) {
      totalCharge += charge;
      chargedTrips++;
    }

    return {
      date: trip.date,
      hasOutOfMalangDestination,
      charge,
      outOfMalangDestinations,
    };
  });

  return {
    totalCharge,
    chargedTrips,
    tripDetails,
  };
}

// ✅ NEW: Region boundaries for minimum trip duration validation
export const REGION_BOUNDARIES = {
  JAWA_TENGAH: {
    name: "Jawa Tengah",
    minLat: -8.5,
    maxLat: -6.0,
    minLng: 108.0,
    maxLng: 111.5,
    minDays: 2,
  },
  JABODETABEK: {
    name: "Jabodetabek",
    minLat: -6.5,
    maxLat: -5.8,
    minLng: 106.0,
    maxLng: 107.2,
    minDays: 3,
  },
  BALI: {
    name: "Bali",
    minLat: -8.8,
    maxLat: -8.0,
    minLng: 114.4,
    maxLng: 115.8,
    minDays: 3,
  },
  LOMBOK: {
    name: "Lombok",
    minLat: -8.9,
    maxLat: -8.1,
    minLng: 115.8,
    maxLng: 116.8,
    minDays: 4,
  },
} as const;

/**
 * Detect which region a coordinate belongs to
 */
export function detectRegion(
  lat: number,
  lng: number
): {
  region: keyof typeof REGION_BOUNDARIES | null;
  name: string | null;
  minDays: number;
} {
  for (const [regionKey, boundary] of Object.entries(REGION_BOUNDARIES)) {
    if (
      lat >= boundary.minLat &&
      lat <= boundary.maxLat &&
      lng >= boundary.minLng &&
      lng <= boundary.maxLng
    ) {
      return {
        region: regionKey as keyof typeof REGION_BOUNDARIES,
        name: boundary.name,
        minDays: boundary.minDays,
      };
    }
  }

  return {
    region: null,
    name: null,
    minDays: 1, // Default minimum is 1 day
  };
}

/**
 * Validate minimum trip duration based on destinations
 */
export function validateTripDuration(
  destinations: Array<{
    lat: number | null;
    lng: number | null;
    address: string;
  }>,
  totalDays: number,
  vehicleType: string
): {
  isValid: boolean;
  message?: string;
  requiredDays?: number;
  detectedRegions?: string[];
  suggestion?: string;
} {
  // Skip validation for Angkot (only operates in Malang area)
  if (vehicleType.toLowerCase() === "angkot") {
    return { isValid: true };
  }

  let maxRequiredDays = 1;
  const detectedRegions: string[] = [];

  // Check each destination
  for (const destination of destinations) {
    if (destination.lat && destination.lng) {
      const regionInfo = detectRegion(destination.lat, destination.lng);

      if (regionInfo.region && regionInfo.name) {
        detectedRegions.push(regionInfo.name);
        maxRequiredDays = Math.max(maxRequiredDays, regionInfo.minDays);
      }
    }
  }

  // If no special regions detected, allow any duration
  if (maxRequiredDays === 1) {
    return { isValid: true };
  }

  // Check if current total days meets requirement
  if (totalDays < maxRequiredDays) {
    const regionNames = [...new Set(detectedRegions)].join(", ");

    return {
      isValid: false,
      message: `Destinasi di ${regionNames} memerlukan minimal ${maxRequiredDays} hari perjalanan, tetapi Anda hanya memilih ${totalDays} hari.`,
      requiredDays: maxRequiredDays,
      detectedRegions: [...new Set(detectedRegions)],
      suggestion: `Silakan tambahkan trip hingga total ${maxRequiredDays} hari atau lebih untuk melanjutkan pemesanan.`,
    };
  }

  return {
    isValid: true,
    detectedRegions: [...new Set(detectedRegions)],
  };
}

/**
 * Validate time format (HH:mm)
 */
export function validateTimeFormat(time: string | null | undefined): {
  isValid: boolean;
  message?: string;
  normalizedTime?: string;
} {
  if (!time || time.trim() === "") {
    return {
      isValid: false,
      message: "Waktu harus diisi",
    };
  }

  const trimmedTime = time.trim();

  // Check basic HH:mm format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(trimmedTime)) {
    return {
      isValid: false,
      message: "Format waktu harus HH:mm (contoh: 09:00, 14:30)",
    };
  }

  // Parse hours and minutes
  const [hours, minutes] = trimmedTime.split(":").map(Number);

  // Additional validation
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return {
      isValid: false,
      message: "Waktu tidak valid. Jam: 00-23, Menit: 00-59",
    };
  }

  // Normalize format (ensure leading zeros)
  const normalizedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

  return {
    isValid: true,
    normalizedTime,
  };
}

/**
 * Validate all destinations have required arrival time
 */
export function validateDestinationTimes(
  destinations: Array<{ address: string; time: string | null | undefined }>
): {
  isValid: boolean;
  message?: string;
  invalidDestinations?: number[];
} {
  const invalidDestinations: number[] = [];

  destinations.forEach((dest, index) => {
    if (!dest.address) return; // Skip empty destinations

    const timeValidation = validateTimeFormat(dest.time);
    if (!timeValidation.isValid) {
      invalidDestinations.push(index + 1); // 1-based index for user display
    }
  });

  if (invalidDestinations.length > 0) {
    const destNumbers = invalidDestinations.join(", ");
    return {
      isValid: false,
      message: `Destinasi ${destNumbers} belum memiliki waktu yang valid. Semua destinasi wajib memiliki waktu keberangkatan.`,
      invalidDestinations,
    };
  }

  return { isValid: true };
}
