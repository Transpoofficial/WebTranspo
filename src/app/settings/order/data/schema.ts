import { z } from "zod"

// Schema for the order data
export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orderType: z.enum(["TRANSPORT", "TOUR"]), // Assuming orderType can be TRANSPORT or PACKAGE
  orderStatus: z.enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED", "REFUNDED"]), // Adjust enum values as needed
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  user: z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
    password: z.string(),
    phoneNumber: z.string(),
    address: z.string().nullable(),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]), // Adjust roles as needed
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  transportation: z
    .object({
      id: z.string(),
      orderId: z.string(),
      departureDate: z.string().datetime(),
      pickupLocation: z.string(),
      destination: z.string(),
      vehicleCount: z.number().int().positive(),
      roundTrip: z.boolean(),
      totalDistance: z.number().positive(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      destinations: z.array(
        z.object({
          id: z.string(),
          transportationOrderId: z.string(),
          destinationName: z.string(),
          createdAt: z.string().datetime(),
          updatedAt: z.string().datetime(),
        }),
      ),
    })
    .nullable(), // transportation can be null if orderType is PACKAGE
  packageOrder: z.unknown().nullable(), // Assuming packageOrder structure is not provided
})

export type Order = z.infer<typeof orderSchema>