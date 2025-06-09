import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the nearest upcoming order - using separate queries for different order types
    const transportOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        orderType: "TRANSPORT",
        orderStatus: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        transportation: {
          include: {
            destinations: {
              orderBy: {
                departureDate: "asc",
              },
              where: {
                isPickupLocation: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const packageOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        orderType: "TOUR",
        orderStatus: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        packageOrder: {
          include: {
            package: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Compare dates to find the nearest order
    let nearestOrder = null;

    const transportDate =
      transportOrder?.transportation?.destinations[0]?.departureDate;
    const packageDate = packageOrder?.packageOrder?.departureDate;

    if (transportDate && packageDate) {
      // Compare dates if both exist
      nearestOrder =
        new Date(transportDate) < new Date(packageDate)
          ? transportOrder
          : packageOrder;
    } else {
      // Choose whichever exists
      nearestOrder = transportDate ? transportOrder : packageOrder;
    }

    // Get all services from the data file
    const services = await prisma.vehicleType.findMany();

    return NextResponse.json({
      user,
      nearestOrder,
      services,
    });
  } catch (error) {
    console.error("Error fetching customer dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer dashboard data" },
      { status: 500 }
    );
  }
}
