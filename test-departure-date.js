// Quick test to verify the departure date implementation
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testPaymentQuery() {
  try {
    console.log("🔍 Testing payment query structure...");

    // Test the exact query structure from payment-approval.ts
    const payment = await prisma.payment.findFirst({
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
            vehicleType: {
              select: {
                name: true,
                pricePerKm: true,
              },
            },
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
          },
        },
      },
    });

    if (payment) {
      console.log("✅ Query structure is valid");
      console.log("📄 Payment found:", {
        id: payment.id,
        orderType: payment.order.orderType,
        hasTransportation: !!payment.order.transportation,
        hasPackageOrder: !!payment.order.packageOrder,
        createdAt: payment.order.createdAt,
      });

      // Test departure date logic
      let departureDate;
      if (
        payment.order.orderType === "TRANSPORT" &&
        payment.order.transportation
      ) {
        const firstDestination = payment.order.transportation.destinations[0];
        departureDate =
          firstDestination?.departureDate || payment.order.createdAt;
        console.log("🚗 Transport departure date:", departureDate);
        console.log("📍 First destination:", firstDestination?.address);
      } else if (
        payment.order.orderType === "TOUR" &&
        payment.order.packageOrder
      ) {
        departureDate = payment.order.packageOrder.departureDate;
        console.log("🎒 Tour departure date:", departureDate);
        console.log(
          "📦 Package name:",
          payment.order.packageOrder.package.name
        );
      } else {
        departureDate = payment.order.createdAt;
        console.log("⏰ Fallback to creation date:", departureDate);
      }

      // Show the difference
      const createdAt = payment.order.createdAt;
      const isSameDate = departureDate.getTime() === createdAt.getTime();
      console.log(
        "📅 Using departure date instead of creation date:",
        !isSameDate
      );
    } else {
      console.log("❌ No payments found in database");

      // Let's check if there are any orders at all
      const orderCount = await prisma.order.count();
      const paymentCount = await prisma.payment.count();
      console.log("📊 Orders in DB:", orderCount);
      console.log("💳 Payments in DB:", paymentCount);
    }
  } catch (error) {
    console.error("❌ Error in query:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

console.log("🚀 Starting departure date test...");
testPaymentQuery()
  .then(() => {
    console.log("✅ Test completed");
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
  });
