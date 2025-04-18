import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";

export const GET = async (req: NextRequest) => {
  try {
    const orders = await prisma.order.findMany({
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
      { message: "Order retrieved successfully", data: orders },
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
    const body: any = {};
    const destinations: string[] = [];
    // Collect form data into body object
    formData.forEach((value, key) => {
      const match = key.match(/^destinations\[(\d+)\]$/);
      if (match) {
        const index = parseInt(match[1], 10); // Extract the index from the key
        destinations[index] = value as string; // Insert the value into the array at the corresponding index
      } else {
        body[key] = value; // Other keys are added to the body object
      }
    });

    // Collect user data from the request
    const token = await checkAuth(req);
    // Main Data
    let { orderType } = body;
    orderType = orderType.toUpperCase() === "TRANSPORT" ? "TRANSPORT" : "TOUR";
    const { derpartureDate, pickupTime, timezone } = body;

    // Transportation Order Data
    const {
      pickupLocation,
      destination,
      passengerCount,
      vehicleCount,
      roundTrip,
      vehicleTypeId, // Collect the vehicle type based on user selection
      totalDistance,
      // destinations,
    } = body;

    // Package Order Data
    const { packageId } = body;

    // Basic Validation
    if (!orderType || !derpartureDate || !timezone) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: orderType, derpartureDate, or timezone",
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
        passengerCount === undefined ||
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

    const formatedDerpartureDate = DateTime.fromFormat(
      `${derpartureDate} ${pickupTime}`,
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
        take: parseInt(vehicleCount),
      });
      if (availableVehicles.length < parseInt(vehicleCount)) {
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
          departureDate: formatedDerpartureDate.toUTC().toJSDate(),
          pickupLocation,
          destination,
          passengerCount: parseInt(passengerCount),
          vehicleCount: parseInt(vehicleCount),
          roundTrip: roundTrip === "true" ? true : false,
          totalDistance: parseFloat(totalDistance),
          orderId: createdOrder.id,
        },
      });

      if (availableVehicles.length < vehicleCount) {
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
        destinations.map((destination: any) =>
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
          packageId,
          derpartureDate: formatedDerpartureDate.toUTC().toJSDate(),
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
