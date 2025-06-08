import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, MapPin } from "lucide-react";
import { OrderData } from "../page";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface Step3Props {
  orderData: OrderData;
  setOrderData?: React.Dispatch<React.SetStateAction<any>>;
  onContinue: (paymentData?: { id: string; amount: number }) => void; // Modified to accept payment data
  onBack: () => void;
}

const Step3 = ({ orderData, setOrderData, onContinue, onBack }: Step3Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Format date as "Senin, 05 Mei 2025"
  const formatLocalizedDate = (date: Date) => {
    return format(date, "EEEE, dd MMMM yyyy", { locale: id });
  };

  // Format time - handles both 24h format and formatted display
  const formatTime = (time: string | null) => {
    if (!time) return "Tidak ditentukan";

    try {
      // Check if time is in 24h format (HH:MM)
      if (time.includes(":")) {
        const [hours, minutes] = time.split(":");
        const hourNum = parseInt(hours, 10);

        // Format to 12-hour with AM/PM
        const period = hourNum >= 12 ? "PM" : "AM";
        const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${hour12}:${minutes} ${period}`;
      }

      return time; // Return as is if not in expected format
    } catch (e) {
      return time; // Return original on any error
    }
  };

  // Group trips by date for better display
  const tripsByDate = orderData.trip.reduce((acc: any, trip) => {
    const dateStr = format(trip.date, "yyyy-MM-dd");
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: trip.date,
        trips: [],
      };
    }

    acc[dateStr].trips.push(trip);
    return acc;
  }, {});

  // Format price as Rupiah
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("Rp", "Rp.");
  };

  const displayPrice = orderData.totalPrice || 0;

  // Handle creating order
  const handleCreateOrder = async () => {
    try {
      setIsSubmitting(true);

      // Create a FormData object to send the order data
      const formData = new FormData();

      // Add basic order information
      formData.append("orderType", "TRANSPORT");

      // Add vehicle details
      formData.append(
        "vehicleCount",
        orderData.userData.totalVehicles.toString()
      );
      formData.append("roundTrip", "false"); // Assuming one-way trip by default
      formData.append("vehicleTypeId", orderData.vehicleTypeId);
      formData.append("totalDistance", orderData.totalDistance.toString());

      // Add price for payment creation
      formData.append("totalPrice", orderData.totalPrice.toString());

      // Add all destinations with their full details
      orderData.trip.forEach((trip, tripIndex) => {
        trip.location.forEach((loc, locIndex) => {
          if (loc.address) {
            const index = tripIndex * 100 + locIndex;

            // Add location data
            formData.append(`destinations[${index}].address`, loc.address);
            formData.append(
              `destinations[${index}].lat`,
              loc.lat?.toString() || "0"
            );
            formData.append(
              `destinations[${index}].lng`,
              loc.lng?.toString() || "0"
            );

            // Mark first location in first trip as pickup
            formData.append(
              `destinations[${index}].isPickupLocation`,
              tripIndex === 0 && locIndex === 0 ? "true" : "false"
            );

            // Add departure date for first location in each trip
            if (locIndex === 0) {
              formData.append(
                `destinations[${index}].departureDate`,
                format(trip.date, "yyyy-MM-dd")
              );

              // Add time info for departure
              formData.append(
                `destinations[${index}].departureTime`,
                trip.startTime || "09:00"
              );
            }

            // Add sequence number
            formData.append(
              `destinations[${index}].sequence`,
              index.toString()
            );

            // If location has arrival time info, add it
            if (loc.time) {
              formData.append(`destinations[${index}].arrivalTime`, loc.time);
            }
          }
        });
      });

      // Extract timezone for server-side processing
      formData.append(
        "timezone",
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );

      // Send the order to the API
      const response = await axios.post("/api/orders", formData);

      if (response.status === 201) {
        toast.success("Pesanan berhasil dibuat!");

        // Extract payment info from response
        const paymentData = response.data.data.payment;

        // Move to the next step with payment data
        onContinue({
          id: paymentData.id,
          amount: parseFloat(paymentData.totalPrice),
        });
      } else {
        toast.error("Gagal membuat pesanan. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat membuat pesanan"
      );
    } finally {
      setIsSubmitting(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="mx-auto max-w-4xl shadow-sm border-gray-100">
        {/* Card content remains the same */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-700 font-medium">
            Detail Pesanan
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Customer Details */}
          <div className="space-y-2">
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="text-gray-700">Nama</span>
              <span className="font-medium">: {orderData.userData.name}</span>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="text-gray-700">No Telepon</span>
              <span className="font-medium">: {orderData.userData.phone}</span>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="text-gray-700">Jumlah Penumpang</span>
              <span className="font-medium">
                : {orderData.userData.totalPassangers}
              </span>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="text-gray-700">Jumlah Armada</span>
              <span className="font-medium">
                : {orderData.userData.totalVehicles}
              </span>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
              <span className="text-gray-700">Tanggal Pesanan</span>
              <span className="font-medium">
                <ul className="list-disc ml-5 space-y-1">
                  {Object.values(tripsByDate).map((item: any) => (
                    <li key={format(item.date, "yyyy-MM-dd")}>
                      {formatLocalizedDate(item.date)}
                    </li>
                  ))}
                </ul>
              </span>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
              <span className="text-gray-700">Total Biaya Pesanan</span>
              <span className="font-medium text-teal-600">
                : {formatRupiah(displayPrice)}
              </span>
            </div>
          </div>

          {/* Journey Details */}
          <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline mt-4">
            <span className="text-gray-700">Detail Perjalanan</span>
            <div className="space-y-6">
              {Object.values(tripsByDate).map((item: any) => (
                <div
                  key={format(item.date, "yyyy-MM-dd")}
                  className="space-y-4 border-b pb-4 last:border-b-0"
                >
                  <h3 className="font-medium text-lg text-teal-700">
                    {formatLocalizedDate(item.date)}
                  </h3>

                  {item.trips.map((trip: any, tripIndex: number) => (
                    <div key={tripIndex} className="ml-2 space-y-4">
                      <div className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                        <Clock size={15} />
                        <span>Jadwal Perjalanan #{tripIndex + 1}</span>
                      </div>

                      <div className="space-y-3 ml-2 border-l-2 border-gray-200 pl-4">
                        {trip.location.map(
                          (loc: any, locIndex: number) =>
                            loc.address && (
                              <div
                                key={locIndex}
                                className="flex items-start space-x-3"
                              >
                                <div
                                  className={`${
                                    locIndex === 0
                                      ? "text-red-500"
                                      : "text-teal-500"
                                  } mt-1`}
                                >
                                  <MapPin size={18} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {loc.address.split(",")[0] ||
                                      `Destinasi ${locIndex + 1}`}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span>
                                        Estimasi tiba:{" "}
                                        {loc.time
                                          ? formatTime(loc.time)
                                          : "Tidak ditentukan"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                        )}
                      </div>

                      {/* Trip details (distance, duration) */}
                      {(trip.distance || trip.duration) && (
                        <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3 ml-2">
                          {trip.distance && (
                            <div className="bg-gray-100 px-2 py-1 rounded-md">
                              Jarak: {(trip.distance / 1000).toFixed(1)} km
                            </div>
                          )}
                          {trip.duration && (
                            <div className="bg-gray-100 px-2 py-1 rounded-md">
                              Durasi: {Math.floor(trip.duration / 60)} menit
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-end space-x-3 mt-8">
            <Button
              onClick={onBack}
              variant="secondary"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700"
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <Button
              onClick={() => setIsConfirmDialogOpen(true)}
              className="bg-teal-500 hover:bg-teal-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Buat Pesanan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pemesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan membuat pesanan transportasi dengan total biaya{" "}
              <span className="font-semibold text-teal-600">
                {formatRupiah(displayPrice)}
              </span>
              .
              <br />
              <br />
              Pastikan semua detail perjalanan sudah benar karena pesanan yang
              telah dibuat tidak dapat diubah.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSubmitting}
              className="border-gray-300"
            >
              Batalkan
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateOrder}
              disabled={isSubmitting}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {isSubmitting ? "Memproses..." : "Ya, Buat Pesanan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Step3;
