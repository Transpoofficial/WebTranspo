import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getPaginationParams } from "@/utils/pagination";
import { OrderStatus, OrderType, PaymentStatus, Prisma } from "@prisma/client";
import { calculateDistance, calculateTotalPrice } from "@/utils/order";
import { calculateRouteDistanceWithDirectionsAPI } from "@/utils/google-maps";
import {
  logCalculationDiscrepancy,
  isDiscrepancyAcceptable,
} from "@/utils/calculation-monitoring";
import {
  validatePickupLocation,
  validateAngkotDestination,
  requiresAllDestinationRestriction,
  validateTripDuration,
  validateDestinationTimes,
} from "@/utils/validation";

// Types
interface OrderRequestBody {
  orderType?: string;
  timezone?: string;
  vehicleCount?: string;
  roundTrip?: string;
  vehicleTypeId?: string;
  totalDistance?: string;
  totalPrice?: string;
  packageId?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  totalPassengers?: string;
  note?: string;
  departureDate?: string;
}

interface Destination {
  address: string;
  lat: number;
  lng: number;
  arrivalTime?: string;
  departureDate?: string;
  departureTime?: string;
  isPickupLocation: boolean;
  sequence: number;
}

interface ValidatedTransportData {
  actualTotalDistance: number;
  actualTotalPrice: number;
  interTripCharges: number;
  basePrice: number;
  elfOutOfMalangCharges?: number;
}

interface TripForCalculation {
  date: Date;
  location: Array<{
    lat: number;
    lng: number;
    address: string;
    time?: string | null;
  }>;
  distance?: number;
  duration?: number;
  startTime?: string;
}

// Helper function to sanitize note
const sanitizeNote = (input: string | undefined): string | null => {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();
  if (trimmed.length === 0) return null;

  // Basic sanitization - remove HTML tags and limit length
  const sanitized = trimmed
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Remove angle brackets
    .substring(0, 500); // Limit to 500 characters

  return sanitized.length > 0 ? sanitized : null;
};

//  Calculate route distance using Google Maps Directions API (same as frontend)
const calculateRouteDistance = async (
  locations: Array<{ lat: number; lng: number }>
): Promise<number> => {
  if (locations.length < 2) return 0;

  try {
    // Use same Directions API as frontend for consistency
    const result = await calculateRouteDistanceWithDirectionsAPI(locations);
    return result.distance; // Return in meters for consistency with frontend
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

    // Convert to meters for consistency with frontend
    return totalDistance * 1000;
  }
};

//  Validate transport pricing with backend re-calculation using same API as frontend
const validateTransportPricing = async (
  destinations: Destination[],
  vehicleTypeId: string,
  vehicleCount: number,
  frontendDistance: number,
  frontendPrice: number,
  request?: NextRequest
): Promise<ValidatedTransportData> => {
  // Get vehicle type for pricing calculation
  const vehicleType = await prisma.vehicleType.findUnique({
    where: { id: vehicleTypeId },
  });

  if (!vehicleType) {
    throw new Error("Vehicle type not found");
  }

  // Group destinations by date to form trips
  const tripsByDate = new Map<string, Destination[]>();

  destinations.forEach((dest) => {
    const dateKey = dest.departureDate || "default";
    if (!tripsByDate.has(dateKey)) {
      tripsByDate.set(dateKey, []);
    }
    tripsByDate.get(dateKey)?.push(dest);
  });

  // Calculate backend distance using same Directions API as frontend
  let actualTotalDistance = 0;
  const tripsForCalculation: TripForCalculation[] = [];

  for (const [dateStr, tripDestinations] of tripsByDate.entries()) {
    // Sort destinations by sequence within the trip
    const sortedDestinations = tripDestinations.sort(
      (a, b) => a.sequence - b.sequence
    );

    // Extract locations for distance calculation
    const locations = sortedDestinations.map((dest) => ({
      lat: dest.lat,
      lng: dest.lng,
      address: dest.address,
      time: dest.arrivalTime || null,
    }));

    // Calculate trip distance using same Directions API as frontend
    let tripDistance = 0;
    try {
      tripDistance = await calculateRouteDistance(locations);
    } catch (error) {
      console.error(`Error calculating distance for trip ${dateStr}:`, error);
      // Fallback to Haversine if Directions API fails
      if (locations.length >= 2) {
        for (let i = 0; i < locations.length - 1; i++) {
          const distance = calculateDistance(
            locations[i].lat,
            locations[i].lng,
            locations[i + 1].lat,
            locations[i + 1].lng
          );
          tripDistance += distance * 1000; // Convert to meters
        }
      }
    }

    actualTotalDistance += tripDistance;

    // Prepare trip data for inter-trip calculation
    tripsForCalculation.push({
      date: new Date(dateStr),
      location: locations,
      distance: tripDistance,
      startTime: "09:00",
    });
  }

  // Convert total distance from meters to kilometers
  const actualTotalDistanceKm = actualTotalDistance / 1000;

  // ✅ NEW: Use updated calculateTotalPrice with per-trip mechanism
  // Note: actualTotalDistanceKm is now only used for validation, not calculation
  const priceResult = calculateTotalPrice(
    vehicleType.name,
    actualTotalDistanceKm, // This parameter is now ignored in favor of individual trip distances
    vehicleCount,
    tripsForCalculation // Each trip has its own distance for calculation
  );

  // ✅ Enhanced validation with dynamic tolerance based on distance and vehicle type
  const priceDifference = Math.abs(priceResult.totalPrice - frontendPrice);
  // ✅ FIXED: Frontend sends distance in km, no conversion needed
  const frontendDistanceKm = frontendDistance;

  // ✅ Log discrepancy for monitoring BEFORE validation
  if (
    priceDifference > 5000 ||
    Math.abs(actualTotalDistanceKm - frontendDistanceKm) > 1
  ) {
    logCalculationDiscrepancy({
      vehicleType: vehicleType.name,
      frontendDistance: frontendDistanceKm,
      backendDistance: actualTotalDistanceKm,
      frontendPrice,
      backendPrice: priceResult.totalPrice,
      distanceDifference: Math.abs(actualTotalDistanceKm - frontendDistanceKm),
      priceDifference,
      userAgent: request?.headers.get("user-agent") || "unknown",
    });
  }

  // ✅ Use intelligent discrepancy checking
  const discrepancyCheck = isDiscrepancyAcceptable(
    frontendPrice,
    priceResult.totalPrice,
    frontendDistanceKm,
    actualTotalDistanceKm,
    vehicleType.name
  );

  if (!discrepancyCheck.acceptable) {
    const errorDetails = {
      vehicle: vehicleType.name,
      expectedPrice: priceResult.totalPrice,
      receivedPrice: frontendPrice,
      priceDifference,
      backendDistance: actualTotalDistanceKm,
      frontendDistance: frontendDistanceKm,
      distanceDiscrepancy: Math.abs(actualTotalDistanceKm - frontendDistanceKm),
      reason: discrepancyCheck.reason,
      recommendation: discrepancyCheck.recommendation,
    };

    console.error("Price validation failed:", errorDetails);

    throw new Error(
      `Price validation failed. Expected: Rp ${priceResult.totalPrice.toLocaleString()}, ` +
        `Received: Rp ${frontendPrice.toLocaleString()}. ` +
        `${discrepancyCheck.reason}. ${discrepancyCheck.recommendation}`
    );
  }

  // ✅ FIXED: Frontend sends distance in km, backend expects in km (no conversion needed)
  const distanceDifference = Math.abs(
    actualTotalDistance - frontendDistance * 1000 // Backend distance is in meters, frontend is in km
  );

  // ✅ RESTORED: Normal distance tolerances after fixing root cause
  let distanceTolerancePercentage = 0.1; // 10% base tolerance

  if (actualTotalDistanceKm > 1000) {
    distanceTolerancePercentage = 0.15; // 15% for very long distances (>1000km)
  } else if (actualTotalDistanceKm > 500) {
    distanceTolerancePercentage = 0.12; // 12% for long distances (>500km)
  } else if (actualTotalDistanceKm > 200) {
    distanceTolerancePercentage = 0.1; // 10% for medium distances (>200km)
  }

  // Log detailed distance comparison for debugging
  console.log("🔍 Distance Validation Debug:", {
    actualTotalDistanceKm,
    frontendDistanceKm: frontendDistance, // ✅ FIXED: No conversion needed
    distanceDifferenceKm: distanceDifference / 1000,
    tolerancePercentage: distanceTolerancePercentage * 100 + "%",
    isValid:
      distanceDifference <=
      actualTotalDistance * distanceTolerancePercentage + 5000, // ✅ FIXED: 5km minimum
  });

  const maxAllowedDistanceDifference = Math.max(
    actualTotalDistance * distanceTolerancePercentage,
    5000 // 5km minimum tolerance (restored to normal)
  );

  if (distanceDifference > maxAllowedDistanceDifference) {
    const frontendDistanceKm = frontendDistance; // ✅ FIXED: No conversion needed

    console.error("Distance validation failed:", {
      backendDistance: actualTotalDistanceKm,
      frontendDistance: frontendDistanceKm,
      difference: distanceDifference / 1000,
      toleranceUsed: distanceTolerancePercentage * 100,
      maxAllowed: maxAllowedDistanceDifference / 1000,
    });

    throw new Error(
      `Distance validation failed. Expected: ${actualTotalDistanceKm.toFixed(3)} km, ` +
        `Received: ${frontendDistanceKm.toFixed(3)} km. ` +
        `Difference: ${(distanceDifference / 1000).toFixed(3)} km. ` +
        `Please refresh the page and recalculate the route.`
    );
  }
  return {
    actualTotalDistance,
    actualTotalPrice: priceResult.totalPrice,
    interTripCharges: priceResult.interTripCharges,
    basePrice: priceResult.basePrice,
    elfOutOfMalangCharges: priceResult.elfOutOfMalangCharges,
  };
};

//  Handle transport order creation
const handleTransportOrder = async (
  tx: Prisma.TransactionClient,
  orderId: string,
  body: OrderRequestBody,
  destinations: Destination[],
  timezone: string,
  req: NextRequest
) => {
  const { vehicleCount, roundTrip, vehicleTypeId, totalDistance, totalPrice } =
    body;

  // Validate required fields
  if (
    !vehicleTypeId ||
    !totalDistance ||
    vehicleCount === undefined ||
    roundTrip === undefined
  ) {
    throw new Error("Missing required fields for transportation order");
  }

  // Get vehicle type for pickup location validation
  const vehicleType = await tx.vehicleType.findUnique({
    where: { id: vehicleTypeId },
    select: { name: true },
  });

  if (!vehicleType) {
    throw new Error("Invalid vehicle type");
  }

  // AREA RESTRICTION VALIDATION
  // Sort destinations by departure date to find the very first day
  const sortedDestinations = destinations.sort((a, b) => {
    const dateA = a.departureDate || "";
    const dateB = b.departureDate || "";
    return dateA.localeCompare(dateB);
  });

  // Check if this vehicle type requires all destinations to be restricted (like Angkot)
  if (requiresAllDestinationRestriction(vehicleType.name)) {
    // For Angkot: validate ALL destinations
    for (let i = 0; i < destinations.length; i++) {
      const destination = destinations[i];
      const angkotValidation = validateAngkotDestination(
        destination.lat,
        destination.lng
      );

      if (!angkotValidation.isValid) {
        throw new Error(
          `Destinasi ${i + 1} tidak valid: ${angkotValidation.message}`
        );
      }
    }
  } else {
    // ✅ TRIP DURATION VALIDATION - Only for non-Angkot vehicles
    const uniqueDates = new Set(destinations.map((dest) => dest.departureDate));
    const totalDays = uniqueDates.size;

    const durationValidation = validateTripDuration(
      destinations.map((dest) => ({
        lat: dest.lat,
        lng: dest.lng,
        address: dest.address,
      })),
      totalDays,
      vehicleType.name
    );

    if (!durationValidation.isValid) {
      throw new Error(
        `Validasi durasi perjalanan gagal: ${durationValidation.message}`
      );
    }

    // ✅ TIME VALIDATION - Only pickup locations must have valid departure times
    // Apply default time "09:00" for missing times before validation
    const pickupDestinations = destinations.filter(
      (dest) => dest.isPickupLocation
    );
    const timeValidation = validateDestinationTimes(
      pickupDestinations.map((dest) => ({
        address: dest.address,
        time: dest.departureTime || "09:00", // Apply default time if missing
      }))
    );

    if (!timeValidation.isValid) {
      throw new Error(
        `Validasi waktu keberangkatan gagal: ${timeValidation.message}`
      );
    }

    // For other vehicles (ELF, Hiace): only validate pickup location (first destination of first trip)
    const firstDay = sortedDestinations[0].departureDate;
    const firstDayDestinations = sortedDestinations.filter(
      (dest) => dest.departureDate === firstDay
    );
    const truePickupLocation = firstDayDestinations[0]; // First destination of first day

    // Validate only the true pickup location (first destination of first trip)
    const pickupValidation = validatePickupLocation(
      truePickupLocation.lat,
      truePickupLocation.lng,
      vehicleType.name
    );

    if (!pickupValidation.isValid) {
      throw new Error(
        `Pickup location area restriction: ${pickupValidation.message}. Vehicle: ${vehicleType.name}, Allowed areas: ${pickupValidation.allowedAreas?.join(", ")}`
      );
    }
  }

  //  Validate pricing and distance with backend re-calculation
  const validationResult = await validateTransportPricing(
    destinations,
    vehicleTypeId,
    parseInt(vehicleCount),
    parseFloat(totalDistance),
    parseFloat(totalPrice || "0"),
    req // Pass request object for logging
  );

  // Create transportation order with validated data
  const transportationOrder = await tx.transportationOrder.create({
    data: {
      orderId: orderId,
      vehicleCount: parseInt(vehicleCount),
      roundTrip: roundTrip === "true",
      totalDistance: validationResult.actualTotalDistance, //  Use backend validated distance
    },
  });

  // Set default values for time
  const defaultDepartureTime = "09:00";

  // Create all destinations with proper departure dates
  await Promise.all(
    destinations.map((dest) => {
      const departureDateStr = dest.departureDate;
      const departureTimeStr = dest.departureTime || defaultDepartureTime;

      const dateTimeString = `${departureDateStr} ${departureTimeStr}`;
      const departureDatetime = DateTime.fromFormat(
        dateTimeString,
        "yyyy-MM-dd HH:mm",
        { zone: timezone }
      ).toJSDate();

      return tx.destinationTransportation.create({
        data: {
          transportationOrderId: transportationOrder.id,
          lat: dest.lat,
          lng: dest.lng,
          address: dest.address,
          arrivalTime: dest.arrivalTime,
          isPickupLocation: dest.isPickupLocation,
          sequence: dest.sequence,
          departureDate: departureDatetime,
        },
      });
    })
  );

  return {
    validatedDistance: validationResult.actualTotalDistance,
    validatedPrice: validationResult.actualTotalPrice,
    interTripCharges: validationResult.interTripCharges,
    basePrice: validationResult.basePrice,
    elfOutOfMalangCharges: validationResult.elfOutOfMalangCharges || 0,
  };
};

//  Handle tour package order creation
const handleTourPackageOrder = async (
  tx: Prisma.TransactionClient,
  orderId: string,
  body: OrderRequestBody
) => {
  const { packageId, totalPassengers, departureDate } = body;

  if (!packageId || !departureDate) {
    throw new Error("Missing required fields for package order");
  }

  const tourPackage = await tx.tourPackage.findUnique({
    where: { id: packageId },
    select: {
      price: true,
      is_private: true,
      minPersonCapacity: true,
      maxPersonCapacity: true,
    },
  });

  if (!tourPackage) {
    throw new Error("Tour package not found");
  }

  const basePrice = parseFloat(tourPackage.price.toString());
  let validatedPrice = basePrice;

  if (tourPackage.is_private) {
    const people = parseInt(totalPassengers || "0");

    if (!people || isNaN(people)) {
      throw new Error("Jumlah peserta diperlukan untuk private trip");
    }

    if (people < tourPackage.minPersonCapacity) {
      throw new Error(
        `Jumlah peserta kurang dari minimum: ${tourPackage.minPersonCapacity} orang`
      );
    }

    if (people > tourPackage.maxPersonCapacity) {
      throw new Error(
        `Jumlah peserta melebihi maksimum: ${tourPackage.maxPersonCapacity} orang`
      );
    }

    validatedPrice = basePrice * people;

    await tx.packageOrder.create({
      data: {
        orderId,
        packageId,
        departureDate: new Date(departureDate),
        people,
      },
    });
  } else {
    await tx.packageOrder.create({
      data: {
        orderId,
        packageId,
        departureDate: new Date(departureDate),
      },
    });
  }

  return {
    validatedPrice,
  };
};

// Update the GET handler in route.ts
export const GET = async (req: NextRequest) => {
  try {
    const { skip, limit } = getPaginationParams(req.url);
    const { searchParams } = new URL(req.url);

    // Get user from token
    const token = await checkAuth(req);

    // Get user with role information
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: { role: true },
    });

    // Search parameters
    const search = searchParams.get("search") || "";
    const orderTypes = searchParams.getAll("orderType");
    const orderStatuses = searchParams.getAll("orderStatus");
    const vehicleTypes = searchParams.getAll("vehicleType");
    const paymentStatuses = searchParams.getAll("paymentStatus");
    const dateFilter = searchParams.get("dateFilter") || "7";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const isPrivate = searchParams.get("isPrivate");

    // Build filter conditions
    const whereConditions: Prisma.OrderWhereInput = {};

    // Only filter by userId if user is CUSTOMER
    if (user?.role === "CUSTOMER") {
      whereConditions.userId = token.id;
    }

    // Date filtering
    if (dateFilter === "custom" && startDate && endDate) {
      whereConditions.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      const days = parseInt(dateFilter);
      if (!isNaN(days)) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        whereConditions.createdAt = {
          gte: date,
          lte: new Date(),
        };
      }
    }

    // Search filter
    if (search) {
      whereConditions.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phoneNumber: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { phoneNumber: { contains: search } } },
      ];
    }

    // Order type filter
    if (orderTypes.length > 0) {
      whereConditions.orderType = {
        in: orderTypes as OrderType[],
      };
    }

    // Order status filter
    if (orderStatuses.length > 0) {
      whereConditions.orderStatus = {
        in: orderStatuses as OrderStatus[],
      };
    }

    // Vehicle type filter
    if (vehicleTypes.length > 0) {
      whereConditions.vehicleType = {
        name: {
          in: vehicleTypes,
        },
      };
    }

    // Payment status filter
    if (paymentStatuses.length > 0) {
      whereConditions.payment = {
        paymentStatus: {
          in: paymentStatuses as PaymentStatus[],
        },
      };
    }

    // Tour type filter (only applicable when orderType includes TOUR)
    if (
      isPrivate !== null &&
      (orderTypes.includes("TOUR") || orderTypes.length === 0)
    ) {
      whereConditions.packageOrder = {
        package: {
          is_private: isPrivate === "true",
        },
      };
    }

    // Get total count with filters
    const totalCount = await prisma.order.count({
      where: whereConditions,
    });

    const orders = await prisma.order.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        transportation: {
          include: {
            destinations: true,
          },
        },
        packageOrder: {
          include: {
            package: true,
          },
        },
        vehicleType: true,
        payment: true,
      },
    });

    return NextResponse.json(
      {
        message: "Order retrieved successfully",
        data: orders,
        pagination: {
          total: totalCount,
          skip,
          limit,
          hasMore: skip + orders.length < totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    // Get user data first to verify user exists
    const token = await checkAuth(req);

    // Check if user exists in DB to avoid foreign key violation
    const userExists = await prisma.user.findUnique({
      where: { id: token.id },
    });

    if (!userExists) {
      console.error("❌ User not found in database:", token.id);
      return NextResponse.json(
        { message: "User not found. Please log in again.", data: [] },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    // Parse form data
    const body: OrderRequestBody = {};
    const destinations: Destination[] = [];
    const timezone = (formData.get("timezone") as string) || "Asia/Jakarta";

    // Parse form data
    formData.forEach((value, key) => {
      // Handle destination data
      const destMatch = key.match(/^destinations\[(\d+)\]\.(.+)$/);
      if (destMatch) {
        const index = parseInt(destMatch[1], 10);
        const property = destMatch[2];

        // Ensure the destination object exists
        if (!destinations[index]) {
          destinations[index] = {
            address: "",
            lat: 0,
            lng: 0,
            isPickupLocation: false,
            sequence: index,
          };
        }

        // Set the appropriate property
        switch (property) {
          case "address":
            destinations[index].address = value as string;
            break;
          case "lat":
            destinations[index].lat = parseFloat(value as string) || 0;
            break;
          case "lng":
            destinations[index].lng = parseFloat(value as string) || 0;
            break;
          case "arrivalTime":
            destinations[index].arrivalTime = value as string;
            break;
          case "departureDate":
            destinations[index].departureDate = value as string;
            break;
          case "departureTime":
            destinations[index].departureTime = value as string;
            break;
          case "isPickupLocation":
            destinations[index].isPickupLocation = value === "true";
            break;
          case "sequence":
            destinations[index].sequence = parseInt(value as string, 10);
            break;
        }
        return;
      }

      // Other fields
      body[key as keyof OrderRequestBody] = value as string;
    });

    // Filter out incomplete destinations and process them
    const unsortedDestinations = destinations.filter(
      (dest) => dest && dest.address
    );

    // Process destinations (existing logic...)
    const datedDestinations = unsortedDestinations.filter(
      (dest) => dest.departureDate
    );

    const explicitDates = new Set<string>();
    datedDestinations.forEach((dest) => {
      if (dest.departureDate) {
        explicitDates.add(dest.departureDate);
      }
    });

    const availableDates = Array.from(explicitDates).sort();
    const defaultDate = DateTime.now().plus({ days: 5 }).toFormat("yyyy-MM-dd");

    if (availableDates.length === 0) {
      availableDates.push(defaultDate);
    }

    const processedDestinations: Destination[] = [];

    datedDestinations.forEach((dest) => {
      processedDestinations.push({
        ...dest,
        departureDate: dest.departureDate,
      });
    });

    const undatedDestinations = unsortedDestinations.filter(
      (dest) => !dest.departureDate
    );

    undatedDestinations.sort((a, b) => a.sequence - b.sequence);

    undatedDestinations.forEach((dest) => {
      let dateToUse: string;

      if (dest.sequence < 100) {
        dateToUse = availableDates[0];
      } else if (availableDates.length > 1) {
        dateToUse = availableDates[1];
      } else {
        dateToUse = availableDates[0];
      }

      processedDestinations.push({
        ...dest,
        departureDate: dateToUse,
      });
    });

    processedDestinations.sort((a, b) => {
      const dateA = a.departureDate || "";
      const dateB = b.departureDate || "";

      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      return a.sequence - b.sequence;
    });

    const validDestinations = processedDestinations.map((dest, idx) => ({
      ...dest,
      sequence: idx,
    }));

    // Set first destination of each date as pickup location
    const destByDate = new Map<string, Destination[]>();

    validDestinations.forEach((dest) => {
      const date = dest.departureDate || "";
      if (!destByDate.has(date)) {
        destByDate.set(date, []);
      }
      destByDate.get(date)?.push(dest);
    });

    for (const [, dests] of destByDate.entries()) {
      if (dests.length > 0) {
        dests.forEach((d) => (d.isPickupLocation = false));
        dests[0].isPickupLocation = true;
      }
    }

    // Ensure we have at least one destination for transport orders
    const { orderType } = body;

    if (orderType?.toUpperCase() === "TRANSPORT" && !validDestinations.length) {
      return NextResponse.json(
        { message: "No valid destinations provided", data: [] },
        { status: 400 }
      );
    }

    // Basic validation
    const {
      vehicleTypeId,
      totalPrice,
      fullName,
      phoneNumber,
      email,
      totalPassengers,
      note,
    } = body;

    // Verify required fields
    if (!orderType || !timezone) {
      return NextResponse.json(
        { message: "Missing required fields: orderType or timezone", data: [] },
        { status: 400 }
      );
    }

    // Sanitize note
    const sanitizedNote = sanitizeNote(note);

    //  Create order in transaction with validation
    const result = await prisma.$transaction(
      async (tx) => {
        // Create base order
        const createdOrder = await tx.order.create({
          data: {
            orderType: orderType.toUpperCase() as OrderType,
            userId: token.id,
            orderStatus: OrderStatus.PENDING,
            fullName: fullName || userExists?.fullName || "Customer",
            phoneNumber: phoneNumber || userExists.phoneNumber || "",
            email: email || userExists.email || "",
            totalPassengers: totalPassengers ? parseInt(totalPassengers) : null,
            vehicleTypeId: vehicleTypeId || null,
            note: sanitizedNote,
          },
        });

        let validatedPrice = parseFloat(totalPrice || "0");

        //  Handle different order types with validation
        if (orderType.toUpperCase() === "TRANSPORT") {
          const transportResult = await handleTransportOrder(
            tx,
            createdOrder.id,
            body,
            validDestinations,
            timezone,
            req
          );
          validatedPrice = transportResult.validatedPrice;
        } else if (orderType.toUpperCase() === "TOUR") {
          const tourResult = await handleTourPackageOrder(
            tx,
            createdOrder.id,
            body
          );
          validatedPrice = tourResult.validatedPrice;
        } else {
          throw new Error("Invalid order type");
        }

        // Create payment record with validated price
        const payment = await tx.payment.create({
          data: {
            orderId: createdOrder.id,
            senderName: "",
            transferDate: new Date(),
            paymentStatus: PaymentStatus.PENDING,
            totalPrice: validatedPrice, //  Use validated price
          },
        });

        return {
          order: createdOrder,
          payment: payment,
        };
      },
      { timeout: 60000, maxWait: 60000 }
    );

    // Return created order with payment data
    return NextResponse.json(
      {
        message: "Order created successfully",
        data: {
          ...result.order,
          payment: result.payment,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating order:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    // Return specific error message for validation failures
    if (
      error instanceof Error &&
      (error.message.includes("validation failed") ||
        error.message.includes("not found") ||
        error.message.includes("Missing required fields"))
    ) {
      return NextResponse.json(
        { message: error.message, data: [] },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};
