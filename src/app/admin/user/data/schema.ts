import { z } from "zod"

export const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  password: z.string().optional(),
  phoneNumber: z.string().nullable(),
  address: z.string().nullable(),
  role: z.enum(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type User = z.infer<typeof userSchema>
