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

interface Step1Props {
  orderData: OrderData;
  startDate: Date;
  setOrderData: React.Dispatch<React.SetStateAction<any>>;
  onContinue: () => void;
  onBack: () => void;
}

const Step1 = ({
  orderData,
  startDate,
  setOrderData,
  onBack,
  onContinue,
}: Step1Props) => {
  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderData((prev: any) => ({
      ...prev,
      userData: {
        ...prev.userData,
        [name]: value,
      },
    }));
  };
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
    <Card className="mx-auto max-w-4xl shadow-sm border-gray-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-700 font-medium">
          DATA PEMESANAN
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              name="name"
              value={orderData.userData.name}
              onChange={handleUserDataChange}
              placeholder="Yanto"
              className="bg-gray-100 border-gray-200"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">No. Telepon</Label>
            <Input
              id="phone"
              name="phone"
              value={orderData.userData.phone}
              onChange={handleUserDataChange}
              placeholder="08123456789"
              className="bg-gray-100 border-gray-200"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={orderData.userData.email}
              onChange={handleUserDataChange}
              placeholder="Yanto123@gmail.com"
              className="bg-gray-100 border-gray-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Passenger Count */}
          <div className="space-y-2">
            <Label htmlFor="totalPassangers">Jumlah Penumpang</Label>
            <Input
              id="totalPassangers"
              name="totalPassangers"
              type="number"
              value={orderData.userData.totalPassangers || ""}
              onChange={handleUserDataChange}
              placeholder="40"
              className="bg-gray-100 border-gray-200"
            />
          </div>

          {/* Vehicle Count */}
          <div className="space-y-2">
            <Label htmlFor="totalVehicles">Jumlah Armada</Label>
            <Input
              id="totalVehicles"
              name="totalVehicles"
              type="number"
              value={orderData.userData.totalVehicles || ""}
              onChange={handleUserDataChange}
              placeholder="4"
              className="bg-gray-100 border-gray-200"
            />
          </div>
        </div>

        {/* Order Dates */}
        <div className="space-y-2">
          <Label>Tanggal Pesanan</Label>
          <div className="space-y-2">
            {orderData.trip.map((destination, index) => (
              <div key={index} className="flex items-center gap-2 w-full">
                <div className="flex-grow">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-gray-100 border-gray-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {destination.date ? (
                          formatLocalizedDate(destination.date)
                        ) : (
                          <span>Pilih tanggal</span>
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
                  variant="destructive"
                  size="icon"
                  className="flex-shrink-0 h-10 w-10"
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
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={addDateField}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            onClick={onBack}
            variant="secondary"
            className="bg-gray-300 hover:bg-gray-400 text-gray-700"
          >
            Kembali
          </Button>
          <Button
            onClick={onContinue}
            className="bg-teal-500 hover:bg-teal-600"
          >
            Selanjutnya
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step1;
