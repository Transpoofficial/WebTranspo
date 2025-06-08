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

interface Step3Props {
  orderData: OrderData;
  setOrderData?: React.Dispatch<React.SetStateAction<any>>;
  onContinue: (paymentData?: { id: string; amount: number }) => void;
  onBack: () => void;
}

const PAYMENT_ID_KEY = "transpo_payment_id";
// const PAYMENT_AMOUNT_KEY = "transpo_payment_amount";

const Step3 = ({ orderData, onContinue, onBack }: Step3Props) => {
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
      formData.append("roundTrip", "false");
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

        // Save ONLY payment ID in localStorage (not amount for security)
        if (typeof window !== "undefined") {
          localStorage.setItem(PAYMENT_ID_KEY, paymentData.id);
        }

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
      <Card
        className="mx-auto max-w-4xl shadow-lg border-0 text-gray-600"
        style={{ boxShadow: "0 5px 35px rgba(0, 0, 0, 0.2)" }}
      >
        <CardHeader className="text-center rounded-t-lg">
          <CardTitle className="text-2xl font-semibold">
            DETAIL PESANAN
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg border-b pb-2 text-transpo-primary">
              Informasi Pemesan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              <div className="space-y-1">
                <div className="text-gray-500 text-sm">Nama</div>
                <div className="font-medium">{orderData.userData.name}</div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500 text-sm">No Telepon</div>
                <div className="font-medium">{orderData.userData.phone}</div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500 text-sm">Jumlah Penumpang</div>
                <div className="font-medium">
                  {orderData.userData.totalPassangers}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500 text-sm">Jumlah Armada</div>
                <div className="font-medium">
                  {orderData.userData.totalVehicles}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-gray-500 text-sm">Tanggal Pesanan</div>
              <div className="font-medium">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.values(tripsByDate).map((item: any) => (
                    <li key={format(item.date, "yyyy-MM-dd")}>
                      {formatLocalizedDate(item.date)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-1 mt-2">
              <div className="text-gray-500 text-sm">Total Biaya Pesanan</div>
              <div className="font-semibold text-lg text-transpo-primary">
                {formatRupiah(displayPrice)}
              </div>
            </div>
          </div>

          {/* Journey Details */}
          <div className="space-y-6">
            <h3 className="font-medium text-lg border-b pb-2 text-transpo-primary">
              Detail Perjalanan
            </h3>

            <div className="space-y-8">
              {Object.values(tripsByDate).map(
                (item: any, dateIndex: number) => (
                  <div
                    key={format(item.date, "yyyy-MM-dd")}
                    className="space-y-4"
                  >
                    <div className="bg-gray-50 p-3 rounded-md border-l-4 border-transpo-primary">
                      <h3 className="font-medium text-transpo-primary-dark">
                        {formatLocalizedDate(item.date)}
                      </h3>
                    </div>

                    {item.trips.map((trip: any, tripIndex: number) => (
                      <div key={tripIndex} className="ml-2 space-y-4">
                        <div className="ml-4 space-y-6">
                          {trip.location.map(
                            (loc: any, locIndex: number) =>
                              loc.address && (
                                <div
                                  key={locIndex}
                                  className="flex items-start"
                                >
                                  <div className="mr-4 relative">
                                    <div
                                      className={`
                                    w-10 h-10 rounded-full flex items-center justify-center 
                                    ${
                                      locIndex === 0
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-transpo-primary-light text-transpo-primary"
                                    }
                                  `}
                                    >
                                      <MapPin size={18} />
                                    </div>
                                    {locIndex < trip.location.length - 1 && (
                                      <div className="absolute top-10 bottom-0 left-1/2 w-0.5 h-16 bg-gray-300 -translate-x-1/2"></div>
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <div className="font-medium text-gray-800">
                                      {loc.address.split(",")[0] ||
                                        `Destinasi ${locIndex + 1}`}
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">
                                      {loc.address}
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                      <Clock className="h-3.5 w-3.5 text-transpo-primary" />
                                      <span>
                                        Pukul Kedatangan:{" "}
                                        <span className="font-medium">
                                          {loc.time
                                            ? formatTime(loc.time)
                                            : "Tidak ditentukan"}
                                        </span>
                                      </span>
                                    </div>

                                    {locIndex === 0 && (
                                      <div className="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block">
                                        Penjemputan
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                          )}
                        </div>

                        {/* Trip details (distance, duration) */}
                        {(trip.distance || trip.duration) && (
                          <div className="mt-4 ml-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Informasi Perjalanan:
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              {trip.distance && (
                                <div className="flex items-center gap-1">
                                  <MapPin
                                    size={14}
                                    className="text-transpo-primary"
                                  />
                                  <span>
                                    Jarak: {(trip.distance / 1000).toFixed(1)}{" "}
                                    km
                                  </span>
                                </div>
                              )}
                              {trip.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock
                                    size={14}
                                    className="text-transpo-primary"
                                  />
                                  <span>
                                    Durasi: {Math.floor(trip.duration / 60)}{" "}
                                    menit
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-gray-300 hover:bg-gray-100 text-gray-700"
              disabled={isSubmitting}
            >
              Kembali
            </Button>
            <Button
              onClick={() => setIsConfirmDialogOpen(true)}
              className="bg-transpo-primary hover:bg-transpo-primary-dark"
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
              <span className="font-semibold text-transpo-primary">
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
              className="bg-transpo-primary hover:bg-transpo-primary-dark"
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
