import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getPaginationParams } from "@/utils/pagination";
import { OrderStatus, OrderType, PaymentStatus, PrismaClient, Prisma } from "@prisma/client";
import { calculateDistance, calculateTotalPrice } from "@/utils/order";

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

//  Calculate route distance using Google Maps-like approach (simplified)
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

  // Convert to meters for consistency with frontend
  return totalDistance * 1000;
};

//  Validate and recalculate transport pricing
const validateTransportPricing = async (
  destinations: Destination[],
  vehicleTypeId: string,
  vehicleCount: number,
  frontendDistance: number,
  frontendPrice: number
): Promise<ValidatedTransportData> => {
  console.log("🔍 Starting transport pricing validation...");

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

  // Calculate actual distance for each trip
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

    // Calculate trip distance using the same function as frontend
    const tripDistance = calculateRouteDistance(locations);
    actualTotalDistance += tripDistance;

    // Prepare trip data for inter-trip calculation
    tripsForCalculation.push({
      date: new Date(dateStr),
      location: locations,
      distance: tripDistance,
      startTime: "09:00",
    });

    console.log(`📊 Trip ${dateStr}: ${(tripDistance / 1000).toFixed(2)} km`);
  }

  // Convert total distance from meters to kilometers for price calculation
  const actualTotalDistanceKm = actualTotalDistance / 1000;

  console.log(
    `📏 Frontend distance: ${(frontendDistance / 1000).toFixed(2)} km`
  );
  console.log(
    `📏 Backend calculated distance: ${actualTotalDistanceKm.toFixed(2)} km`
  );

  // Use consistent price calculation with the same function as frontend
  const priceResult = calculateTotalPrice(
    vehicleType.name,
    actualTotalDistanceKm, // Already in km
    vehicleCount,
    tripsForCalculation
  );

  console.log(`💰 Frontend price: Rp ${frontendPrice.toLocaleString()}`);
  console.log(
    `💰 Backend calculated price: Rp ${priceResult.totalPrice.toLocaleString()}`
  );
  console.log(`💰 Base price: Rp ${priceResult.basePrice.toLocaleString()}`);
  console.log(
    `💰 Inter-trip charges: Rp ${priceResult.interTripCharges.toLocaleString()}`
  );

  // More relaxed validation tolerance (10% for API calculated prices)
  const priceDifference = Math.abs(priceResult.totalPrice - frontendPrice);
  const priceTolerancePercentage = 0.1; // 10% tolerance since both use same calculation
  const maxAllowedDifference =
    priceResult.totalPrice * priceTolerancePercentage;

  if (priceDifference > maxAllowedDifference) {
    console.log(
      `❌ Price validation failed: difference ${priceDifference} > tolerance ${maxAllowedDifference}`
    );
    throw new Error(
      `Price validation failed. Expected: Rp ${priceResult.totalPrice.toLocaleString()}, ` +
        `Received: Rp ${frontendPrice.toLocaleString()}`
    );
  }

  // Validate distance difference (allow 10% tolerance for routing differences)
  const distanceDifference = Math.abs(
    actualTotalDistance - frontendDistance * 1000
  ); // Convert frontend to meters
  const distanceTolerancePercentage = 0.1; // 10%
  const maxAllowedDistanceDifference =
    actualTotalDistance * distanceTolerancePercentage;

  if (distanceDifference > maxAllowedDistanceDifference) {
    console.log(
      `❌ Distance validation failed: difference ${distanceDifference}m > tolerance ${maxAllowedDistanceDifference}m`
    );
    throw new Error(
      `Distance validation failed. Expected: ${actualTotalDistanceKm.toFixed(
        2
      )} km, ` + `Received: ${(frontendDistance / 1000).toFixed(2)} km`
    );
  }

  console.log("✅ Transport pricing validation passed");

  return {
    actualTotalDistance,
    actualTotalPrice: priceResult.totalPrice,
    interTripCharges: priceResult.interTripCharges,
    basePrice: priceResult.basePrice,
  };
};

//  Handle transport order creation
const handleTransportOrder = async (
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  orderId: string,
  body: OrderRequestBody,
  destinations: Destination[],
  timezone: string
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

  //  Validate pricing and distance
  const validationResult = await validateTransportPricing(
    destinations,
    vehicleTypeId,
    parseInt(vehicleCount),
    parseFloat(totalDistance),
    parseFloat(totalPrice || "0")
  );

  // Create transportation order with validated data
  const transportationOrder = await tx.transportationOrder.create({
    data: {
      orderId: orderId,
      vehicleCount: parseInt(vehicleCount),
      roundTrip: roundTrip === "true",
      totalDistance: validationResult.actualTotalDistance, //  Use validated distance
    },
  });

  // Set default values for time
  const defaultDepartureTime = "09:00";

  // Create all destinations with proper departure dates
  await Promise.all(
    destinations.map((dest) => {
      const departureDateStr = dest.departureDate;
      const departureTimeStr = dest.departureTime || defaultDepartureTime;

      console.log(`Creating destination: ${dest.address}`);
      console.log(`Date: ${departureDateStr}, Time: ${departureTimeStr}`);
      console.log(`Is pickup location: ${dest.isPickupLocation}`);

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
  };
};

//  Handle tour package order creation
const handleTourPackageOrder = async (
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  orderId: string,
  body: OrderRequestBody
) => {
  const { packageId, totalPrice } = body;

  if (!packageId) {
    throw new Error("Missing required fields for package order");
  }

  // Validate package exists and get pricing
  const tourPackage = await prisma.tourPackage.findUnique({
    where: { id: packageId },
  });

  if (!tourPackage) {
    throw new Error("Tour package not found");
  }

  //  Validate package pricing - Convert Decimal to number
  const frontendPrice = parseFloat(totalPrice || "0");
  const actualPackagePrice = parseFloat(tourPackage.price.toString()); //  Convert Decimal to number

  if (Math.abs(frontendPrice - actualPackagePrice) > 1000) {
    // Allow small rounding differences
    throw new Error(
      `Package price validation failed. Expected: Rp ${actualPackagePrice.toLocaleString()}, ` +
        `Received: Rp ${frontendPrice.toLocaleString()}`
    );
  }

  console.log(" Tour package pricing validation passed");

  // Create package order
  await tx.packageOrder.create({
    data: {
      orderId: orderId,
      packageId: packageId,
      departureDate: new Date(), // Default date for now
    },
  });

  return {
    validatedPrice: actualPackagePrice, //  Return converted number
  };
};

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
    const orderType = searchParams.get("orderType") || "";
    const orderStatus = searchParams.get("orderStatus") || "";
    const vehicleType = searchParams.get("vehicleType") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";    // Build filter conditions
    const whereConditions: Prisma.OrderWhereInput = {};

    // Only filter by userId if user is CUSTOMER
    // ADMIN and SUPER_ADMIN can see all orders
    if (user?.role === "CUSTOMER") {
      whereConditions.userId = token.id;
    }

    // Search filter - searches across user info, order details
    if (search) {
      whereConditions.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phoneNumber: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { phoneNumber: { contains: search } } },
      ];
    }    // Order type filter
    if (orderType) {
      whereConditions.orderType = orderType as OrderType;
    }

    // Order status filter
    if (orderStatus) {
      whereConditions.orderStatus = orderStatus as OrderStatus;
    }

    // Vehicle type filter
    if (vehicleType) {
      whereConditions.vehicleType = {
        name: vehicleType,
      };
    }

    // Payment status filter
    if (paymentStatus) {
      whereConditions.payment = {
        paymentStatus: paymentStatus as PaymentStatus,
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
        packageOrder: true,
        vehicleType: true,
        payment: {
          select: {
            id: true,
            orderId: true,
            senderName: true,
            transferDate: true,
            proofUrl: true,
            paymentStatus: true,
            totalPrice: true,
            approvedByAdminId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        review: true,
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
    console.log(error);
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
    });    for (const [, dests] of destByDate.entries()) {
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
    }    // Basic validation - only destructure variables that are used
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
    const result = await prisma.$transaction(async (tx) => {
      // Create base order
      const createdOrder = await tx.order.create({
        data: {
          orderType: orderType.toUpperCase() as OrderType,
          userId: token.id,
          orderStatus: OrderStatus.PENDING,
          fullName: fullName || userExists?.fullName || "Customer",
          phoneNumber: phoneNumber || userExists.phoneNumber || null,
          email: email || userExists.email || null,
          totalPassengers: totalPassengers ? parseInt(totalPassengers) : null,
          vehicleTypeId: vehicleTypeId || null,
          note: sanitizedNote,
        },
      });

      console.log(`Order created with ID: ${createdOrder.id}`);

      let validatedPrice = parseFloat(totalPrice || "0");

      //  Handle different order types with validation
      if (orderType.toUpperCase() === "TRANSPORT") {
        const transportResult = await handleTransportOrder(
          tx,
          createdOrder.id,
          body,
          validDestinations,
          timezone
        );
        validatedPrice = transportResult.validatedPrice;

        console.log(
          ` Transport order validated: price=${validatedPrice}, distance=${transportResult.validatedDistance}`
        );
      } else if (orderType.toUpperCase() === "TOUR") {
        const tourResult = await handleTourPackageOrder(
          tx,
          createdOrder.id,
          body
        );
        validatedPrice = tourResult.validatedPrice;

        console.log(` Tour package order validated: price=${validatedPrice}`);
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
    });

    console.log(` Order successfully created with validated pricing`);

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
