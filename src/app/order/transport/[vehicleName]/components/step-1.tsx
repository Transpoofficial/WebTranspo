import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/form";

interface Step1Props {
  orderData: OrderData;
  startDate: Date;
  setOrderData: React.Dispatch<React.SetStateAction<any>>;
  onContinue: () => void;
  onBack: () => void;
}

// Create validation schema with Zod
const formSchema = z.object({
  name: z.string().min(2, "Nama harus diisi minimal 2 karakter"),
  phone: z.string().min(10, "Nomor telepon harus diisi minimal 10 digit"),
  email: z.string().email("Format email tidak valid"),
  totalPassangers: z.coerce
    .number()
    .min(1, "Jumlah penumpang minimal 1")
    .max(100, "Jumlah penumpang maksimal 100"),
  totalVehicles: z.coerce
    .number()
    .min(1, "Jumlah armada minimal 1")
    .max(10, "Jumlah armada maksimal 10"),
});

const Step1 = ({
  orderData,
  startDate,
  setOrderData,
  onBack,
  onContinue,
}: Step1Props) => {
  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: orderData.userData.name,
      phone: orderData.userData.phone,
      email: orderData.userData.email,
      totalPassangers: orderData.userData.totalPassangers || 0,
      totalVehicles: orderData.userData.totalVehicles || 0,
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    // Update orderData with form values, preserving existing logic
    setOrderData((prev: OrderData) => ({
      ...prev,
      userData: {
        ...prev.userData,
        ...values,
      },
    }));

    // Continue to next step
    onContinue();
  };

  // Keep existing date handling logic
  const handleDateChange = (index: number, date: Date) => {
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

    setOrderData((prev: any) => ({
      ...prev,
      destinations: newDestinations,
    }));
  };

  const addDateField = () => {
    const tomorrow = new Date();
    if (orderData.trip.length > 0) {
      const lastDate = new Date(orderData.trip[orderData.trip.length - 1].date);
      tomorrow.setTime(lastDate.getTime() + 24 * 60 * 60 * 1000); // Add one day to last date
    } else {
      tomorrow.setDate(tomorrow.getDate() + 1); // Tomorrow from today if no dates exist
    }

    if (orderData.trip.length >= 5) {
      toast.error("Maksimal 5 tanggal pesanan yang dapat ditambahkan.");
      return;
    }
    setOrderData((prev: OrderData) => ({
      ...prev,
      trip: [
        ...prev.trip,
        {
          date: tomorrow,
          location: { lat: null, lng: null },
          address: "",
          startTime: "",
        },
      ],
    }));
  };

  const formatLocalizedDate = (date: Date) => {
    // Format the date as "Senin, 05 Mei 2025"
    return format(date, "EEEE, dd MMMM yyyy", { locale: id });
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
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary"
                        {...field}
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
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary"
                        {...field}
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
                  <FormItem>
                    <FormLabel className="font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Yanto123@gmail.com"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Passenger Count */}
              <FormField
                control={form.control}
                name="totalPassangers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Jumlah Penumpang
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="40"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Vehicle Count */}
              <FormField
                control={form.control}
                name="totalVehicles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Jumlah Armada</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="4"
                        className="bg-gray-50 border-gray-200 focus-visible:ring-transpo-primary"
                        {...field}
                      />
                    </FormControl>
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
                            variant="outline"
                            className="w-full justify-start font-normal hover:bg-gray-100 hover:text-gray-800 border-gray-200 focus:ring-transpo-primary focus:ring-offset-0"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-transpo-primary" />
                            {destination.date ? (
                              <span className="font-medium">
                                {formatLocalizedDate(destination.date)}
                              </span>
                            ) : (
                              <span className="text-gray-500">
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
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8 rounded-md"
                      onClick={() => {
                        if (orderData.trip.length > 1) {
                          setOrderData((prev: OrderData) => ({
                            ...prev,
                            trip: prev.trip.filter((_, i) => i !== index),
                          }));
                        } else {
                          toast.error("Minimal harus ada 1 tanggal pesanan.");
                        }
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
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-transpo-primary border-transpo-primary hover:bg-transpo-primary-light hover:text-transpo-primary"
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
