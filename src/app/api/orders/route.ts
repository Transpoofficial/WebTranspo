import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getPaginationParams } from "@/utils/pagination";
import { OrderStatus, OrderType, PaymentStatus } from "@prisma/client"; // Import necessary enums

export const GET = async (req: NextRequest) => {
  try {
    const { skip, limit } = getPaginationParams(req.url);

    // Get total count
    const totalCount = await prisma.order.count();

    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      include: {
        user: true,
        transportation: {
          include: {
            destinations: true,
          },
        },
        packageOrder: true,
        vehicleType: true, // Include vehicleType in the response
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

    // Added debug logging for departure dates in form data
    console.log("FORM DATA DEPARTURE DATES:");
    formData.forEach((value, key) => {
      if (key.includes("destinations") && key.includes("departureDate")) {
        console.log(`${key}: ${value}`);
      }
    });

    interface OrderRequestBody {
      orderType?: string;
      timezone?: string;
      vehicleCount?: string;
      roundTrip?: string;
      vehicleTypeId?: string;
      totalDistance?: string;
      totalPrice?: string;
      packageId?: string;
      fullName?: string; // Add fullName field
      phoneNumber?: string; // Add phoneNumber field
      email?: string; // Add email field
      totalPassengers?: string; // Add totalPassengers field
      note?: string; // ✅ Add note field
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

    const body: OrderRequestBody = {};
    const destinations: Destination[] = [];
    const timezone = (formData.get("timezone") as string) || "Asia/Jakarta";

    // Parse form data
    formData.forEach((value, key) => {
      // Handle destination data - complex parsing
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

    // Log raw destinations for debugging
    console.log("Raw destinations after parsing:");
    unsortedDestinations.forEach((dest) => {
      console.log(
        `Seq ${dest.sequence}: ${dest.address} - Date: ${
          dest.departureDate || "none"
        }`
      );
    });

    // NEW APPROACH: Handle explicit date assignment
    // First, collect all destinations with explicit departure dates
    const datedDestinations = unsortedDestinations.filter(
      (dest) => dest.departureDate
    );

    // Extract only the dates that are explicitly set in the input
    const explicitDates = new Set<string>();
    datedDestinations.forEach((dest) => {
      if (dest.departureDate) {
        explicitDates.add(dest.departureDate);
      }
    });

    // Convert to sorted array for consistent processing
    const availableDates = Array.from(explicitDates).sort();
    console.log("Explicit dates found in form data:", availableDates);

    // Default date if none provided
    const defaultDate = DateTime.now().plus({ days: 5 }).toFormat("yyyy-MM-dd");

    // If no dates provided, use default
    if (availableDates.length === 0) {
      availableDates.push(defaultDate);
      console.log("No explicit dates found, using default:", defaultDate);
    }

    // Assign dates to all destinations
    const processedDestinations: Destination[] = [];

    // Process the destinations in batches by sequence number ranges

    // First batch: process destinations that already have dates
    datedDestinations.forEach((dest) => {
      processedDestinations.push({
        ...dest,
        departureDate: dest.departureDate, // Keep original date
      });
    });

    // Second batch: process destinations without dates using sequence based logic
    const undatedDestinations = unsortedDestinations.filter(
      (dest) => !dest.departureDate
    );

    // Sort undated destinations by sequence
    undatedDestinations.sort((a, b) => a.sequence - b.sequence);

    // We'll use sequence number to determine which date to use
    undatedDestinations.forEach((dest) => {
      let dateToUse: string;

      // For sequences < 100, use first date
      // For sequences >= 100, use second date if available
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

    // Sort all processed destinations by date then sequence
    processedDestinations.sort((a, b) => {
      // First sort by date
      const dateA = a.departureDate || "";
      const dateB = b.departureDate || "";

      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      // Then by sequence
      return a.sequence - b.sequence;
    });

    // Reassign sequence numbers to be strictly sequential
    const validDestinations = processedDestinations.map((dest, idx) => ({
      ...dest,
      sequence: idx,
    }));

    // NEW: Set first destination of each date as pickup location
    // Group by date
    const destByDate = new Map<string, Destination[]>();

    validDestinations.forEach((dest) => {
      const date = dest.departureDate || "";
      if (!destByDate.has(date)) {
        destByDate.set(date, []);
      }
      destByDate.get(date)?.push(dest);
    });

    // For each date, mark first destination as pickup
    for (const [date, dests] of destByDate.entries()) {
      if (dests.length > 0) {
        // First, reset all pickup locations for this date to false
        dests.forEach((d) => (d.isPickupLocation = false));

        // Then set the first one to true
        dests[0].isPickupLocation = true;
        console.log(
          `Marking first destination on ${date} as pickup location: ${dests[0].address}`
        );
      }
    }

    // Log final destination list with dates and pickup locations
    console.log("Final destinations with assigned dates and pickup locations:");
    validDestinations.forEach((dest) => {
      console.log(
        `Seq ${dest.sequence}: ${dest.address} - Date: ${dest.departureDate} - Pickup: ${dest.isPickupLocation}`
      );
    });

    // Ensure we have at least one destination
    if (!validDestinations.length) {
      return NextResponse.json(
        { message: "No valid destinations provided", data: [] },
        { status: 400 }
      );
    }

    // Basic validation
    const { orderType } = body;
    const {
      vehicleCount,
      roundTrip,
      vehicleTypeId,
      totalDistance,
      totalPrice,
      packageId,
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

    if (orderType.toUpperCase() === "TRANSPORT") {
      if (
        !vehicleTypeId ||
        !totalDistance ||
        vehicleCount === undefined ||
        roundTrip === undefined ||
        !validDestinations.length
      ) {
        return NextResponse.json(
          {
            message: "Missing required fields for transportation order",
            data: [],
          },
          { status: 400 }
        );
      }
    } else if (orderType.toUpperCase() === "TOUR") {
      if (!packageId) {
        return NextResponse.json(
          { message: "Missing required fields for package order", data: [] },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Invalid order type", data: [] },
        { status: 400 }
      );
    }

    // ✅ Helper function to sanitize note
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

    // ✅ Sanitize note
    const sanitizedNote = sanitizeNote(note);

    // Create order and include payment in the transaction
    const result = await prisma.$transaction(async (tx) => {
      // ✅ Create order - Include sanitized note
      const createdOrder = await tx.order.create({
        data: {
          orderType: orderType.toUpperCase() as OrderType,
          userId: token.id,
          orderStatus: OrderStatus.PENDING,
          fullName: fullName || userExists.fullName || "Customer",
          phoneNumber: phoneNumber || userExists.phoneNumber || null,
          email: email || userExists.email || null,
          totalPassengers: totalPassengers ? parseInt(totalPassengers) : null,
          vehicleTypeId: vehicleTypeId || null,
          note: sanitizedNote,
        },
      });

      // ✅ Log order creation with note
      console.log(
        `Order created with ID: ${createdOrder.id}, Note: ${sanitizedNote}`
      );

      if (orderType.toUpperCase() === "TRANSPORT") {
        // Create transportation order
        const transportationOrders = await tx.transportationOrder.create({
          data: {
            orderId: createdOrder.id,
            vehicleCount: parseInt(vehicleCount || "1"),
            roundTrip: roundTrip === "true",
            totalDistance: parseFloat(totalDistance || "0.0"),
          },
        });

        // Set default values for time only
        const defaultDepartureTime = "09:00";

        // Create all destinations with proper departure dates
        await Promise.all(
          validDestinations.map((dest) => {
            // At this point, every destination should have a departureDate
            const departureDateStr = dest.departureDate;

            // Use destination's departure time if available, otherwise default
            const departureTimeStr = dest.departureTime || defaultDepartureTime;

            console.log(`Creating destination: ${dest.address}`);
            console.log(`Date from validDestinations: ${departureDateStr}`);
            console.log(`Time: ${departureTimeStr}`);
            console.log(`Is pickup location: ${dest.isPickupLocation}`);

            // Add timezone debugging
            console.log(`Using timezone: ${timezone}`);

            // Format and log the complete datetime
            const dateTimeString = `${departureDateStr} ${departureTimeStr}`;
            console.log(`Parsing datetime: ${dateTimeString} in ${timezone}`);

            const departureDatetime = DateTime.fromFormat(
              dateTimeString,
              "yyyy-MM-dd HH:mm",
              { zone: timezone }
            ).toJSDate();

            console.log(`Resulting JS Date: ${departureDatetime}`);

            return tx.destinationTransportation.create({
              data: {
                transportationOrderId: transportationOrders.id,
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
      } else if (orderType.toUpperCase() === "TOUR") {
        await tx.packageOrder.create({
          data: {
            orderId: createdOrder.id,
            packageId: packageId || "",
            departureDate: new Date(), // Default date for now
          },
        });
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          senderName: "", // Will be filled when proof is uploaded
          transferDate: new Date(), // Will be updated when proof is uploaded
          paymentStatus: PaymentStatus.PENDING,
          totalPrice: parseFloat(totalPrice || "0"),
        },
      });

      return {
        order: createdOrder,
        payment: payment,
      };
    });

    // ✅ Log successful creation with note
    console.log(`Order successfully created with note: "${sanitizedNote}"`);

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
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};
