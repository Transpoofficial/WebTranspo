import { z } from "zod";

// Schema for destination data
export const destinationSchema = z.object({
  id: z.string(),
  transportationOrderId: z.string(),
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  arrivalTime: z.string(),
  isPickupLocation: z.boolean(),
  sequence: z.number(),
  departureDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for vehicle type data
export const vehicleTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  pricePerKm: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for transportation data
export const transportationSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  vehicleCount: z.number().int().positive(),
  roundTrip: z.boolean(),
  totalDistance: z.number().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
  destinations: z.array(destinationSchema),
});

// Schema for user data
export const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
  phoneNumber: z.string().nullable(),
  address: z.string().nullable(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for payment data
export const paymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  senderName: z.string(),
  transferDate: z.string(),
  proofUrl: z.string().nullable(),
  paymentStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  totalPrice: z.string(),
  approvedByAdminId: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for review data
export const reviewSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  rating: z.number(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for the order data
export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orderType: z.enum(["TRANSPORT", "TOUR"]),
  orderStatus: z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELED",
    "COMPLETED",
    "REFUNDED",
  ]),
  fullName: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  totalPassengers: z.number(),
  vehicleTypeId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: userSchema,
  transportation: transportationSchema.nullable(),
  packageOrder: z.unknown().nullable(),
  payment: paymentSchema,
  vehicleType: vehicleTypeSchema,
  review: reviewSchema.nullable(), // Menambahkan review yang bisa null
});

export type Review = z.infer<typeof reviewSchema>;
export type Destination = z.infer<typeof destinationSchema>;
export type Transportation = z.infer<typeof transportationSchema>;
export type User = z.infer<typeof userSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type VehicleType = z.infer<typeof vehicleTypeSchema>;
