import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getPaginationParams } from "@/utils/pagination";

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
    const formData = await req.formData();
    interface OrderRequestBody {
      orderType?: string;
      departureDate?: string;
      pickupTime?: string;
      timezone?: string;
      pickupLocation?: string;
      destination?: string;
      vehicleCount?: string;
      roundTrip?: string;
      vehicleTypeId?: string;
      totalDistance?: string;
      packageId?: string;
    }

    const body: OrderRequestBody = {};
    const destinations: string[] = [];
    // Collect form data into body object
    formData.forEach((value, key) => {
      const match = key.match(/^destinations\[(\d+)\]$/);
      if (match) {
        const index = parseInt(match[1], 10); // Extract the index from the key
        destinations[index] = value as string; // Insert the value into the array at the corresponding index
      } else {
        body[key as keyof OrderRequestBody] = value as string; // Other keys are added to the body object
      }
    });

    // Collect user data from the request
    const token = await checkAuth(req);
    // Main Data
    let { orderType } = body;
    orderType = orderType?.toUpperCase() === "TRANSPORT" ? "TRANSPORT" : "TOUR";
    const { departureDate, pickupTime, timezone } = body;

    // Transportation Order Data
    const {
      pickupLocation,
      destination,
      vehicleCount,
      roundTrip,
      vehicleTypeId, // Collect the vehicle type based on user selection
      totalDistance,
    } = body;

    // Package Order Data
    const { packageId } = body;

    // Basic Validation
    if (!orderType || !departureDate || !timezone) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: orderType, departureDate, or timezone",
          data: [],
        },
        { status: 400 }
      );
    }

    if (orderType === "TRANSPORT") {
      if (
        !pickupLocation ||
        !destination ||
        !vehicleTypeId ||
        !totalDistance ||
        vehicleCount === undefined ||
        roundTrip === undefined ||
        roundTrip === null ||
        destinations === undefined ||
        destinations === null ||
        destinations.length === 0
      ) {
        return NextResponse.json(
          {
            message: "Missing required fields for transportation order",
            data: [],
          },
          { status: 400 }
        );
      }
    } else if (orderType === "TOUR") {
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

    const formatedDepartureDate = DateTime.fromFormat(
      `${departureDate} ${pickupTime}`,
      "yyyy-MM-dd HH:mm",
      {
        zone: timezone,
      }
    );
    const createdOrder = await prisma.order.create({
      data: {
        orderType,
        userId: token.id,
        orderStatus: "PENDING",
      },
    });

    if (orderType === "TRANSPORT") {
      const availableVehicles = await prisma.vehicle.findMany({
        where: {
          vehicleTypeId: vehicleTypeId,
          transportationOrderId: null,
        },
        take: parseInt(vehicleCount || "0"),
      });
      if (availableVehicles.length < parseInt(vehicleCount || "0")) {
        return NextResponse.json(
          {
            message: "Not enough vehicles available",
            data: [{ availableVehicles: availableVehicles.length }],
          },
          { status: 400 }
        );
      }

      const transportationOrders = await prisma.transportationOrder.create({
        data: {
          departureDate: formatedDepartureDate.toUTC().toJSDate(),
          pickupLocation: pickupLocation || "",
          destination: destination || "",
          vehicleCount: parseInt(vehicleCount || "0"),
          roundTrip: roundTrip === "true" ? true : false,
          totalDistance: parseFloat(totalDistance || "0.0"),
          orderId: createdOrder.id,
        },
      });

      if (availableVehicles.length < parseInt(vehicleCount || "0")) {
        // Rollback the order creation if not enough vehicles are available
        await prisma.order.delete({
          where: { id: createdOrder.id },
        });
        await prisma.transportationOrder.delete({
          where: { id: transportationOrders.id },
        });
        return NextResponse.json(
          {
            message: "Not enough vehicles available",
            data: [{ availableVehicles: availableVehicles.length }],
          },
          { status: 400 }
        );
      }

      await Promise.all(
        availableVehicles.map((vehicle) =>
          prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { transportationOrderId: transportationOrders.id },
          })
        )
      );
      await Promise.all(
        destinations.map((destination: string) =>
          prisma.destinationTransportation.create({
            data: {
              destinationName: destination,
              transportationOrderId: transportationOrders.id,
            },
          })
        )
      );
    } else if (orderType === "TOUR") {
      await prisma.packageOrder.create({
        data: {
          orderId: createdOrder.id,
          packageId: packageId || "",
          departureDate: formatedDepartureDate.toUTC().toJSDate(),
        },
      });
    }

    return NextResponse.json(
      { message: "Order created successfully", data: createdOrder },
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
