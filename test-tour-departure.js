// Test TOUR orders specifically
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testTourOrder() {
  try {
    console.log("🔍 Testing TOUR order departure date...");

    // Find a TOUR order specifically
    const payment = await prisma.payment.findFirst({
      where: {
        order: {
          orderType: "TOUR",
        },
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
                address: true,
              },
            },
            packageOrder: {
              include: {
                package: true,
              },
            },
          },
        },
      },
    });

    if (payment) {
      console.log("✅ Found TOUR order");
      console.log("📄 Payment details:", {
        id: payment.id,
        orderType: payment.order.orderType,
        hasPackageOrder: !!payment.order.packageOrder,
        createdAt: payment.order.createdAt,
      });

      if (payment.order.packageOrder) {
        const tourDepartureDate = payment.order.packageOrder.departureDate;
        const orderCreatedAt = payment.order.createdAt;

        console.log(
          "🎒 Tour package:",
          payment.order.packageOrder.package.name
        );
        console.log("📅 Tour departure date:", tourDepartureDate);
        console.log("📅 Order created at:", orderCreatedAt);
        console.log(
          "✨ Using departure date instead of creation date:",
          tourDepartureDate.getTime() !== orderCreatedAt.getTime()
        );
      }
    } else {
      console.log("❌ No TOUR orders found in database");

      // Check for any tour orders at all
      const tourOrderCount = await prisma.order.count({
        where: { orderType: "TOUR" },
      });
      console.log("📊 TOUR orders in DB:", tourOrderCount);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTourOrder();
