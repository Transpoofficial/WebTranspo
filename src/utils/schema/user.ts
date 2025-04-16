import { z } from "zod";

export const signupSchema = z
  .object({
    fullName: z.string().min(1, { message: "Full Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm Password is required" }),
    phoneNumber: z.string({ message: "Phone number is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

export type SigninValues = z.infer<typeof signinSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
