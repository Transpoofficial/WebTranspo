import { prisma } from "@/lib/prisma";
import {
  generateInvoicePDF,
  generateInvoiceNumber,
  InvoiceData,
} from "@/lib/pdf-generator";
import { emailTemplates } from "@/lib/email-templates";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PaymentWithOrder {
  id: string;
  totalPrice: number;
  transferDate: Date;
  senderName: string;
  order: {
    id: string;
    orderType: "TRANSPORT" | "TOUR";
    fullName: string;
    email: string;
    phoneNumber: string;
    totalPassengers: number;
    createdAt: Date;
    user: {
      fullName: string;
      email: string;
      phoneNumber: string;
      address: string;
    };
    vehicleType?: {
      name: string;
      pricePerKm: number;
    };
    transportation?: {
      destinations: Array<{
        address: string;
        lat: number;
        lng: number;
        departureDate: Date;
      }>;
    };
    packageOrder?: {
      package: {
        name: string;
        destination: string;
        durationDays: number;
        price: number;
      };
      departureDate: Date;
    };
  };
}

export async function sendPaymentApprovalWithInvoice(
  paymentId: string
): Promise<void> {
  try {
    // Fetch payment with all related data
    const payment = (await prisma.payment.findUnique({
      where: { id: paymentId },
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
    })) as PaymentWithOrder | null;

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber(paymentId); // Determine the actual departure/travel date
    let departureDate: Date;
    if (
      payment.order.orderType === "TRANSPORT" &&
      payment.order.transportation
    ) {
      // For transport orders, use the first destination's departure date
      const firstDestination = payment.order.transportation.destinations[0];
      departureDate =
        firstDestination?.departureDate || payment.order.createdAt;
    } else if (
      payment.order.orderType === "TOUR" &&
      payment.order.packageOrder
    ) {
      // For tour orders, use the package order's departure date
      departureDate = payment.order.packageOrder.departureDate;
    } else {
      // Fallback to order creation date
      departureDate = payment.order.createdAt;
    }

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      invoiceNumber,
      invoiceDate: format(new Date(), "dd MMMM yyyy", { locale: id }),
      customerName: payment.order.user.fullName,
      customerEmail: payment.order.user.email,
      customerPhone: payment.order.user.phoneNumber || "Tidak tersedia",
      customerAddress: payment.order.user.address || "Alamat tidak tersedia",
      orderType: payment.order.orderType,
      orderDate: format(departureDate, "dd MMMM yyyy", {
        locale: id,
      }),
      totalAmount: Number(payment.totalPrice),
      paymentMethod: "Transfer Bank",
      paymentDate: format(payment.transferDate, "dd MMMM yyyy", { locale: id }),
      items: [],
    }; // Prepare items based on order type
    if (
      payment.order.orderType === "TRANSPORT" &&
      payment.order.transportation
    ) {
      const destinations = payment.order.transportation.destinations;
      invoiceData.destinations = destinations.map((dest) => ({
        address: dest.address,
        departureTime: dest.departureDate
          ? format(dest.departureDate, "dd MMMM yyyy HH:mm", { locale: id })
          : undefined,
      }));

      invoiceData.vehicleType =
        payment.order.vehicleType?.name || "Tidak tersedia";
      invoiceData.items = [
        {
          description: `Layanan Transportasi`,
          quantity: 1,
          unitPrice: Number(payment.totalPrice),
          total: Number(payment.totalPrice),
        },
      ]; // Build a cleaner description
      const descriptionParts = [];

      if (payment.order.vehicleType?.name) {
        descriptionParts.push(`Kendaraan: ${payment.order.vehicleType.name}`);
      }

      if (payment.order.totalPassengers) {
        descriptionParts.push(`${payment.order.totalPassengers} Penumpang`);
      }

      if (destinations.length > 0) {
        descriptionParts.push(`${destinations.length} Destinasi`);
      }

      if (descriptionParts.length > 0) {
        invoiceData.items[0].description = `Layanan Transportasi (${descriptionParts.join(", ")})`;
      }
    } else if (
      payment.order.orderType === "TOUR" &&
      payment.order.packageOrder
    ) {
      const tourPackage = payment.order.packageOrder.package;

      invoiceData.tourPackage = {
        name: tourPackage.name,
        destination: tourPackage.destination,
        duration: `${tourPackage.durationDays} hari`,
      };
      invoiceData.items = [
        {
          description: `Paket Wisata`,
          quantity: payment.order.totalPassengers || 1,
          unitPrice: Number(tourPackage.price),
          total: Number(payment.totalPrice),
        },
      ]; // Build cleaner description for tour
      const tourDescriptionParts = [];

      if (tourPackage.name) {
        tourDescriptionParts.push(`Paket: ${tourPackage.name}`);
      }

      if (tourPackage.destination) {
        tourDescriptionParts.push(`Destinasi: ${tourPackage.destination}`);
      }

      if (tourPackage.durationDays) {
        tourDescriptionParts.push(`Durasi: ${tourPackage.durationDays} Hari`);
      }

      if (tourDescriptionParts.length > 0) {
        invoiceData.items[0].description = `Paket Wisata (${tourDescriptionParts.join(", ")})`;
      }
    }

    // Generate PDF invoice
    const invoiceBuffer = generateInvoicePDF(invoiceData);

    // Send email with PDF attachment
    await emailTemplates.sendPaymentApproval(
      payment.order.user.email,
      payment.order.user.fullName,
      payment.order.orderType === "TRANSPORT" ? "Transportasi" : "Paket Wisata",
      Number(payment.totalPrice),
      invoiceNumber,
      format(payment.transferDate, "dd MMMM yyyy", { locale: id }),
      invoiceBuffer
    );
  } catch (error) {
    console.error(
      `Failed to send payment approval email for payment ${paymentId}:`,
      error
    );
    throw error;
  }
}

export async function sendPaymentRejectionEmail(
  paymentId: string,
  rejectionReason: string
): Promise<void> {
  try {
    // Fetch payment with all related data
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    // Send rejection email
    await emailTemplates.sendPaymentRejection(
      payment.order.user.email,
      payment.order.user.fullName,
      rejectionReason,
      payment.order.orderType === "TRANSPORT" ? "Transportasi" : "Paket Wisata",
      Number(payment.totalPrice)
    );
  } catch (error) {
    console.error(
      `Failed to send payment rejection email for payment ${paymentId}:`,
      error
    );
    throw error;
  }
}
