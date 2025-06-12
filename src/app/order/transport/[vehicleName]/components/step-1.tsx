import React, { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  FormDescription,
} from "@/components/ui/form";
import DOMPurify from "dompurify";
import validator from "validator";
import { useParams } from "next/navigation";

interface Step1Props {
  orderData: OrderData;
  startDate: Date;
  setOrderData: React.Dispatch<React.SetStateAction<OrderData>>;
  onContinue: () => void;
  onBack: () => void;
}

// Vehicle capacity mapping
const VEHICLE_CAPACITY = {
  angkot: {
    capacity: 12,
    description:
      "12+1 (jika 1 orang mau dipaksakan masuk bisa menempati kursi kecil di pintu)",
  },
  "hiace premio": { capacity: 14, description: "14" },
  "hiace commuter": { capacity: 15, description: "15" },
  elf: { capacity: 19, description: "19" },
} as const;

// Helper function untuk sanitize input
const sanitizeInput = (input: string): string => {
  if (typeof window === "undefined") {
    // Server-side fallback
    return input.trim().replace(/[<>]/g, "");
  }

  // Client-side sanitization
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

// Helper function untuk validasi dan sanitize phone number
const sanitizePhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // If starts with +62, keep it; if starts with 0, replace with +62
  if (cleaned.startsWith("0")) {
    cleaned = "+62" + cleaned.substring(1);
  } else if (!cleaned.startsWith("+62") && !cleaned.startsWith("62")) {
    // If doesn't start with country code, assume it's Indonesian number
    cleaned = "+62" + cleaned;
  }

  return cleaned;
};

// Create validation schema with Zod - ✅ Removed max limits
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
  totalPassangers: z.coerce
    .number()
    .min(1, "Jumlah penumpang minimal 1")
    .int("Jumlah penumpang harus berupa angka bulat"),
  totalVehicles: z.coerce
    .number()
    .min(1, "Jumlah armada minimal 1")
    .int("Jumlah armada harus berupa angka bulat"),
});

const Step1 = ({
  orderData,
  startDate,
  setOrderData,
  onBack,
  onContinue,
}: Step1Props) => {
  const params = useParams();
  const vehicleName = decodeURIComponent(
    Array.isArray(params.vehicleName)
      ? params.vehicleName[0]
      : params.vehicleName || ""
  ).toLowerCase();

  // Get vehicle capacity info
  const vehicleInfo =
    VEHICLE_CAPACITY[vehicleName as keyof typeof VEHICLE_CAPACITY];

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      totalPassangers: 0,
      totalVehicles: 0,
    },
  });
  // Helper function to calculate required vehicles
  const calculateRequiredVehicles = useCallback(
    (passengers: number): number => {
      if (!vehicleInfo || passengers <= 0) return 1;
      return Math.ceil(passengers / vehicleInfo.capacity);
    },
    [vehicleInfo]
  );

  // ✅ Update form values when orderData changes (reactive to session data)
  useEffect(() => {
    const userData = orderData.userData;

    // Check if there's meaningful data to populate
    const hasData =
      userData.name ||
      userData.email ||
      userData.phone ||
      userData.totalPassangers > 0 ||
      userData.totalVehicles > 0;

    if (hasData) {
      // Use setValue instead of reset to avoid form state issues
      form.setValue("name", userData.name || "");
      form.setValue("phone", userData.phone || "");
      form.setValue("email", userData.email || "");
      form.setValue("totalPassangers", userData.totalPassangers || 0);
      form.setValue("totalVehicles", userData.totalVehicles || 0);
    }
  }, [orderData.userData, form]);

  // ✅ Watch form values and sync with orderData state (with debounce)
  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      // Only sync specific field changes, not all at once
      if (name && type === "change") {
        // If totalPassangers changed, auto-calculate vehicle count
        if (name === "totalPassangers" && values.totalPassangers) {
          const requiredVehicles = calculateRequiredVehicles(
            values.totalPassangers
          );
          form.setValue("totalVehicles", requiredVehicles);

          // ✅ Fixed TypeScript error - ensure values are always numbers
          setOrderData((prev: OrderData) => ({
            ...prev,
            userData: {
              ...prev.userData,
              totalPassangers: values.totalPassangers ?? 0,
              totalVehicles: requiredVehicles,
            },
          }));
        } else {
          // For other fields, update normally
          setOrderData((prev: OrderData) => ({
            ...prev,
            userData: {
              ...prev.userData,
              [name]:
                values[name as keyof typeof values] ||
                (name === "totalPassangers" || name === "totalVehicles"
                  ? 0
                  : ""),
            },
          }));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setOrderData, vehicleInfo, calculateRequiredVehicles]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      // Additional sanitization layer - ✅ Removed max limits
      const sanitizedValues = {
        name: sanitizeInput(values.name),
        phone: sanitizePhoneNumber(values.phone),
        email: sanitizeInput(values.email.toLowerCase()),
        totalPassangers: Math.max(1, Math.floor(values.totalPassangers)),
        totalVehicles: Math.max(1, Math.floor(values.totalVehicles)),
      };

      // Validate email format one more time
      if (!validator.isEmail(sanitizedValues.email)) {
        toast.error("Format email tidak valid");
        return;
      }

      // Validate phone number format
      if (
        !validator.isMobilePhone(sanitizedValues.phone, "id-ID", {
          strictMode: false,
        })
      ) {
        toast.error("Format nomor telepon tidak valid");
        return;
      }

      // Update orderData with sanitized values
      setOrderData((prev: OrderData) => ({
        ...prev,
        userData: {
          ...prev.userData,
          ...sanitizedValues,
        },
      }));

      // Continue to next step
      onContinue();
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("Terjadi kesalahan saat memproses data. Silakan coba lagi.");
    }
  };

  // Keep existing date handling logic
  const handleDateChange = (index: number, date: Date) => {
    try {
      // Validate date is not in the past
      if (date < startDate) {
        toast.error(
          "Tanggal tidak boleh kurang dari tanggal minimal pemesanan"
        );
        return;
      }

      // Format the date to compare just the date part (ignoring time)
      const formattedNewDate = format(date, "yyyy-MM-dd");

      // Check if this date already exists in another destination
      const dateExists = orderData.trip.some((dest, i) => {
        if (i === index) return false; // Skip the current entry
        return format(dest.date, "yyyy-MM-dd") === formattedNewDate;
      });

      if (dateExists) {
        toast.error("Tanggal ini sudah dipilih. Silakan pilih tanggal lain.");
        return;
      }

      const newDestinations = [...orderData.trip];
      newDestinations[index] = {
        ...newDestinations[index],
        date,
      };

      setOrderData((prev: OrderData) => ({
        ...prev,
        trip: newDestinations,
      }));
    } catch (error) {
      console.error("Error handling date change:", error);
      toast.error("Terjadi kesalahan saat memproses tanggal");
    }
  };

  const addDateField = () => {
    try {
      if (orderData.trip.length >= 5) {
        toast.error("Maksimal 5 tanggal pesanan yang dapat ditambahkan.");
        return;
      }

      let newDate = new Date(startDate);

      if (orderData.trip.length > 0) {
        const lastDate = new Date(
          orderData.trip[orderData.trip.length - 1].date
        );
        newDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000); // Add one day to last date
      }

      setOrderData((prev: OrderData) => ({
        ...prev,
        trip: [
          ...prev.trip,
          {
            date: newDate,
            location: [{ lat: null, lng: null, address: "", time: null }],
            startTime: "",
            distance: 0,
            duration: 0,
          },
        ],
      }));
    } catch (error) {
      console.error("Error adding date field:", error);
      toast.error("Terjadi kesalahan saat menambah tanggal");
    }
  };

  const formatLocalizedDate = (date: Date) => {
    // Format the date as "Senin, 05 Mei 2025"
    return format(date, "EEEE, dd MMMM yyyy", { locale: id });
  };

  // ✅ Helper function to handle number input without leading zeros
  const handleNumberInput = (
    value: string,
    onChange: (value: number) => void
  ) => {
    // Remove leading zeros and convert to number
    const cleanedValue = value.replace(/^0+/, "") || "0";
    const numericValue = parseInt(cleanedValue) || 0;
    const clampedValue = Math.max(0, numericValue);
    onChange(clampedValue);
  };

  return (
    <Card
      className="mx-auto max-w-4xl border-0 text-gray-600"
      style={{ boxShadow: "0 5px 35px rgba(0, 0, 0, 0.2)" }}
    >
      <CardHeader className="text-center rounded-t-lg">
        <CardTitle className="text-2xl font-semibold">DATA PEMESANAN</CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
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
                        placeholder="Yanto"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400"
                        {...field}
                        onChange={(e) => {
                          // Real-time sanitization while typing
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
                          // Allow only numbers and + sign
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
                        placeholder="Yanto123@gmail.com"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400"
                        {...field}
                        onChange={(e) => {
                          // Real-time sanitization while typing
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

            {/* ✅ Fixed Grid Layout for Passengers & Vehicles with Aligned Heights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Passenger Count */}
              <FormField
                control={form.control}
                name="totalPassangers"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-medium">
                      Jumlah Penumpang
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40"
                        min="1"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400"
                        value={field.value || ""}
                        onChange={(e) => {
                          handleNumberInput(e.target.value, field.onChange);
                        }}
                      />
                    </FormControl>
                    {/* ✅ Vehicle Capacity Info with fixed height */}
                    <div className="min-h-[2.5rem] flex items-start">
                      {vehicleInfo && (
                        <FormDescription className="text-xs text-gray-500 leading-tight">
                          💺 Kapasitas ideal per kendaraan:{" "}
                          <span className="font-medium text-transpo-primary">
                            {vehicleInfo.description}
                          </span>
                        </FormDescription>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Count */}
              <FormField
                control={form.control}
                name="totalVehicles"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-medium">Jumlah Armada</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="4"
                        min="1"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400"
                        value={field.value || ""}
                        onChange={(e) => {
                          handleNumberInput(e.target.value, field.onChange);
                        }}
                      />
                    </FormControl>
                    {/* ✅ Description with fixed height to match left field */}
                    <div className="min-h-[2.5rem] flex items-start">
                      <FormDescription className="text-xs text-gray-500 leading-tight">
                        🚐 Jumlah armada akan otomatis terisi berdasarkan jumlah
                        penumpang, namun tetap bisa diubah manual
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Order Dates */}
            <div className="space-y-4 py-2">
              <Label className="font-medium">Tanggal Pesanan</Label>
              <div className="space-y-3">
                {orderData.trip.map((destination, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 w-full bg-gray-50 p-2 rounded-lg border border-gray-200"
                  >
                    <div className="flex-grow">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start font-normal hover:bg-gray-100 hover:text-gray-800 border-gray-200 focus:ring-transpo-primary focus:ring-offset-0"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-transpo-primary" />
                            {destination.date ? (
                              <span className="font-medium text-gray-900">
                                {formatLocalizedDate(destination.date)}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                Pilih tanggal
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={destination.date}
                            onSelect={(date) =>
                              date && handleDateChange(index, date)
                            }
                            disabled={(date) => date < startDate}
                            fromDate={startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {orderData.trip.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8 rounded-md"
                        onClick={() => {
                          setOrderData((prev: OrderData) => ({
                            ...prev,
                            trip: prev.trip.filter((_, i) => i !== index),
                          }));
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-transpo-primary border-transpo-primary hover:border-transpo-primary-light hover:text-transpo-primary-light"
                  onClick={addDateField}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Tambah Tanggal</span>
                </Button>
              </div>
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
