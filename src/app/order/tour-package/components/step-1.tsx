"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { OrderData } from "../page";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DOMPurify from "dompurify";
import validator from "validator";

interface Step1Props {
  orderData: OrderData;
  setOrderData: React.Dispatch<React.SetStateAction<OrderData>>;
  onContinue: () => void;
  onBack: () => void;
}

// Helper function untuk sanitize input
const sanitizeInput = (input: string): string => {
  if (typeof window === "undefined") {
    return input.trim().replace(/[<>]/g, "");
  }
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

// Helper function untuk validasi dan sanitize phone number
const sanitizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "+62" + cleaned.substring(1);
  } else if (!cleaned.startsWith("+62") && !cleaned.startsWith("62")) {
    cleaned = "+62" + cleaned;
  }
  return cleaned;
};

// Validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Nama harus diisi minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      "Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung"
    )
    .transform(sanitizeInput),
  phone: z
    .string()
    .min(10, "Nomor telepon harus diisi minimal 10 digit")
    .max(20, "Nomor telepon maksimal 20 digit")
    .transform(sanitizePhoneNumber)
    .refine(
      (phone) => validator.isMobilePhone(phone, "id-ID", { strictMode: false }),
      {
        message: "Format nomor telepon tidak valid",
      }
    ),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(254, "Email terlalu panjang")
    .transform(sanitizeInput)
    .refine((email) => validator.isEmail(email), {
      message: "Format email tidak valid",
    }),
});

const Step1 = ({ orderData, setOrderData, onBack, onContinue }: Step1Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  // Modifikasi useEffect
  const [hasInitialized, setHasInitialized] = useState(false);

  // Modifikasi useEffect
  useEffect(() => {
    if (!hasInitialized && orderData.userData.name) {
      form.reset({
        name: orderData.userData.name,
        phone: orderData.userData.phone,
        email: orderData.userData.email,
      });
      setHasInitialized(true);
    }
  }, [orderData.userData, form, hasInitialized]);

  // Update form values when orderData changes
  useEffect(() => {
    const userData = orderData.userData;
    if (userData.name || userData.email || userData.phone) {
      form.setValue("name", userData.name || "");
      form.setValue("phone", userData.phone || "");
      form.setValue("email", userData.email || "");
    }
  }, [orderData.userData, form]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const sanitizedValues = {
        name: sanitizeInput(values.name),
        phone: sanitizePhoneNumber(values.phone),
        email: sanitizeInput(values.email.toLowerCase()),
      };

      if (!validator.isEmail(sanitizedValues.email)) {
        toast.error("Format email tidak valid");
        return;
      }

      if (
        !validator.isMobilePhone(sanitizedValues.phone, "id-ID", {
          strictMode: false,
        })
      ) {
        toast.error("Format nomor telepon tidak valid");
        return;
      }

      setOrderData((prev: OrderData) => ({
        ...prev,
        userData: {
          ...prev.userData,
          ...sanitizedValues,
        },
      }));

      onContinue();
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("Terjadi kesalahan saat memproses data. Silakan coba lagi.");
    }
  };

  const formatLocalizedDate = (date: Date) => {
    return format(date, "EEEE, dd MMMM yyyy", { locale: id });
  };

  return (
    <Card
      className="mx-auto max-w-4xl border-0 text-gray-600"
      style={{ boxShadow: "0 5px 35px rgba(0, 0, 0, 0.2)" }}
    >
      <CardHeader className="text-center rounded-t-lg">
        <CardTitle className="text-2xl font-semibold">DETAIL PESANAN</CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">
            Informasi Paket Wisata
          </h3>
          <p className="text-blue-700">{orderData.packageData.name}</p>
          <p className="text-blue-700 mt-1">
            Tipe paket wisata:{" "}
            {orderData.packageData.type === false
              ? "Open Trip"
              : "Private Trip"}
          </p>
          {orderData.packageData.type === true &&
            orderData.tripDetails.people && (
              <>
                <p className="text-blue-700 mt-1">
                  Jumlah orang: {orderData.tripDetails.people} orang
                </p>
                <p className="text-blue-700 mt-1">
                  Harga per orang:{" "}
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(orderData.packageData.price)}
                </p>
              </>
            )}
          <p className="text-blue-700 mt-1">
            Tanggal Keberangkatan:{" "}
            {formatLocalizedDate(orderData.tripDetails.departureDate)}
          </p>
          <p className="text-blue-700 mt-1 font-semibold">
            Total Harga:{" "}
            {orderData.packageData.type === true && orderData.tripDetails.people
              ? new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(orderData.totalPrice)
              : new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(orderData.totalPrice)}
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Nama</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your Name"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400"
                        {...field}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/[<>]/g, "");
                          field.onChange(sanitized);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">No. Telepon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08123456789"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400"
                        {...field}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(
                            /[^\d+]/g,
                            ""
                          );
                          field.onChange(sanitized);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400"
                        {...field}
                        onChange={(e) => {
                          const sanitized = e.target.value
                            .replace(/[<>]/g, "")
                            .toLowerCase();
                          field.onChange(sanitized);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Note Field */}
            <div className="space-y-2">
              <Label className="font-medium">Catatan Tambahan (Opsional)</Label>
              <Input
                placeholder="Tambahkan catatan khusus..."
                className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400"
                value={orderData.tripDetails.note}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[<>]/g, "");
                  setOrderData((prev) => ({
                    ...prev,
                    tripDetails: {
                      ...prev.tripDetails,
                      note: sanitized,
                    },
                  }));
                }}
                maxLength={500}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Kembali
              </Button>
              <Button
                type="submit"
                className="bg-transpo-primary hover:bg-transpo-primary-dark"
              >
                Selanjutnya
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Step1;
