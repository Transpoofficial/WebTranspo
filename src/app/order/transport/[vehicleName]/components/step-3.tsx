import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { OrderData } from "../page";
import axios from "axios";
import { toast } from "sonner";
import { validateTripDuration } from "@/utils/validation";
import { useParams } from "next/navigation";
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
  setOrderData: React.Dispatch<React.SetStateAction<OrderData>>;
  onContinue: (paymentData?: { id: string; amount: number }) => void;
  onBack: () => void;
}

interface TripsByDateItem {
  date: Date;
  trips: {
    location: Array<{
      address: string;
      lat: number | null;
      lng: number | null;
      time: string | null;
    }>;
    distance?: number;
    duration?: number;
    startTime: string;
  }[];
}

interface PriceCalculationResponse {
  vehicleType: string;
  totalDistanceKm: number;
  vehicleCount: number;
  basePrice: number;
  interTripCharges: number;
  elfOutOfMalangCharges?: number;
  totalPrice: number;
  tripBreakdown?: Array<{
    date: string;
    distance: number;
    pricePerTrip: number;
  }>;
  breakdown: {
    tripDistances: Array<{
      date: string;
      distance: number;
    }>;
    interTripDetails: Array<{
      from: string;
      to: string;
      distance: number;
      charge: number;
    }>;
  };
}

const PAYMENT_ID_KEY = "transpo_payment_id";

const Step3 = ({ orderData, setOrderData, onContinue, onBack }: Step3Props) => {
  const params = useParams();
  const vehicleName = decodeURIComponent(
    Array.isArray(params.vehicleName)
      ? params.vehicleName[0]
      : params.vehicleName || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [priceValidationError, setPriceValidationError] = useState<
    string | null
  >(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(true);
  const [calculatedPrice, setCalculatedPrice] =
    useState<PriceCalculationResponse | null>(null);

  // Calculate price using API when component mounts
  useEffect(() => {
    const calculatePrice = async () => {
      if (!orderData.vehicleTypeId || !orderData.trip.length) {
        setIsCalculatingPrice(false);
        return;
      }

      try {
        setIsCalculatingPrice(true);

        // Prepare trips data for API
        const tripsForCalculation = orderData.trip.map((trip) => ({
          date: trip.date,
          location: trip.location.map((loc) => ({
            lat: loc.lat,
            lng: loc.lng,
            address: loc.address,
            time: loc.time,
          })),
          distance: trip.distance,
          duration: trip.duration,
          startTime: trip.startTime || "09:00",
        }));

        const response = await axios.post("/api/calculate-price", {
          vehicleTypeId: orderData.vehicleTypeId,
          vehicleCount: orderData.userData.totalVehicles,
          trips: tripsForCalculation,
        });

        if (response.status === 200) {
          const priceData = response.data.data as PriceCalculationResponse;
          setCalculatedPrice(priceData);

          // Update orderData with calculated values
          setOrderData((prev) => ({
            ...prev,
            totalPrice: priceData.totalPrice,
            totalDistance: priceData.totalDistanceKm * 1000, // Convert to meters for consistency
          }));
        }
      } catch (error) {
        console.error("Error calculating price:", error);
        toast.error("Gagal menghitung harga. Menggunakan estimasi sebelumnya.");
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    calculatePrice();
  }, [
    orderData.vehicleTypeId,
    orderData.trip,
    orderData.userData.totalVehicles,
    setOrderData,
  ]);

  // Format date as "Senin, 05 Mei 2025"
  const formatLocalizedDate = (date: Date) => {
    return format(date, "EEEE, dd MMMM yyyy", { locale: id });
  };

  // Format time - handles both 24h format and formatted display
  const formatTime = (time: string | null) => {
    if (!time) return "Tidak ditentukan";

    try {
      if (time.includes(":")) {
        const [hours, minutes] = time.split(":");
        const hourNum = parseInt(hours, 10);
        const period = hourNum >= 12 ? "PM" : "AM";
        const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${hour12}:${minutes} ${period}`;
      }
      return time;
    } catch (e) {
      console.error("Error formatting time:", e);
      return time;
    }
  };

  // Enhanced duration formatter - converts seconds to hours and minutes
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return "0 menit";

    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} jam ${minutes} menit`;
    } else if (hours > 0) {
      return `${hours} jam`;
    } else {
      return `${minutes} menit`;
    }
  };

  // Group trips by date for better display
  const tripsByDate: Record<string, TripsByDateItem> = orderData.trip.reduce(
    (acc: Record<string, TripsByDateItem>, trip) => {
      const dateStr = format(trip.date, "yyyy-MM-dd");
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: trip.date,
          trips: [],
        };
      }

      acc[dateStr].trips.push(trip);
      return acc;
    },
    {}
  );

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

  // Use calculated price if available, otherwise use orderData price
  const displayPrice = calculatedPrice?.totalPrice || orderData.totalPrice || 0;
  // Handle creating order with enhanced error handling
  const handleCreateOrder = async () => {
    setPriceValidationError(null);

    try {
      setIsSubmitting(true);

      if (!orderData.vehicleTypeId) {
        toast.error(
          "Vehicle type is missing. Please go back and select a vehicle."
        );
        return;
      }

      if (!orderData.trip || orderData.trip.length === 0) {
        toast.error("No trip data found. Please go back and add destinations.");
        return;
      }

      // ✅ Final validation: Check trip duration requirements
      const allDestinations = orderData.trip.flatMap((trip) =>
        trip.location
          .filter((loc) => loc.lat !== null && loc.lng !== null && loc.address)
          .map((loc) => ({
            lat: loc.lat!,
            lng: loc.lng!,
            address: loc.address,
          }))
      );

      const totalDays = orderData.trip.length;
      const durationValidation = validateTripDuration(
        allDestinations,
        totalDays,
        vehicleName
      );

      if (!durationValidation.isValid) {
        toast.error(durationValidation.message);
        setPriceValidationError(
          durationValidation.message || "Validasi durasi gagal"
        );
        return;
      }

      // Create a FormData object to send the order data
      const formData = new FormData();

      // Add basic order information
      formData.append("orderType", "TRANSPORT");
      formData.append(
        "vehicleCount",
        orderData.userData.totalVehicles.toString()
      );
      formData.append("fullName", orderData.userData.name);
      formData.append("phoneNumber", orderData.userData.phone);
      formData.append("email", orderData.userData.email);
      formData.append(
        "totalPassengers",
        orderData.userData.totalPassangers.toString()
      );
      formData.append("roundTrip", "false");
      formData.append("vehicleTypeId", orderData.vehicleTypeId);

      // Use calculated values from API
      formData.append(
        "totalDistance",
        (
          calculatedPrice?.totalDistanceKm || orderData.totalDistance / 1000
        ).toString()
      );
      formData.append("totalPrice", displayPrice.toString());

      // Add note if it exists
      if (orderData.note && orderData.note.trim()) {
        formData.append("note", orderData.note.trim());
      } // Add all destinations with their full details
      orderData.trip.forEach((trip, tripIndex) => {
        trip.location.forEach((loc, locIndex) => {
          if (loc.address) {
            const index = tripIndex * 100 + locIndex;

            formData.append(`destinations[${index}].address`, loc.address);
            formData.append(
              `destinations[${index}].lat`,
              loc.lat?.toString() || "0"
            );
            formData.append(
              `destinations[${index}].lng`,
              loc.lng?.toString() || "0"
            );
            formData.append(
              `destinations[${index}].isPickupLocation`,
              tripIndex === 0 && locIndex === 0 ? "true" : "false"
            );

            // Add departure date for ALL destinations in the same trip
            formData.append(
              `destinations[${index}].departureDate`,
              format(trip.date, "yyyy-MM-dd")
            );

            // Add departure time only for the first destination of each trip
            if (locIndex === 0) {
              formData.append(
                `destinations[${index}].departureTime`,
                trip.startTime || "09:00"
              );
            }

            formData.append(
              `destinations[${index}].sequence`,
              index.toString()
            );

            if (loc.time) {
              formData.append(`destinations[${index}].arrivalTime`, loc.time);
            }
          }
        });
      });
      formData.append(
        "timezone",
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );

      const response = await axios.post("/api/orders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Pesanan berhasil dibuat!");

        const paymentData = response.data.data.payment;

        if (typeof window !== "undefined") {
          localStorage.setItem(PAYMENT_ID_KEY, paymentData.id);
        }
        onContinue({
          id: paymentData.id,
          amount: parseFloat(paymentData.totalPrice),
        });
      } else {
        toast.error("Gagal membuat pesanan. Silakan coba lagi.");
      }
    } catch (error: unknown) {
      console.error("❌ Error creating order:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 400) {
          const errorMessage =
            axiosError.response?.data?.message || "Bad request";

          if (errorMessage.includes("Price validation failed")) {
            setPriceValidationError(errorMessage);
            toast.error(
              "Harga tidak valid. Silakan refresh halaman untuk memperbarui kalkulasi."
            );
          } else if (errorMessage.includes("Distance validation failed")) {
            setPriceValidationError(errorMessage);
            toast.error(
              "Jarak tidak valid. Silakan kembali ke step sebelumnya untuk memperbarui rute."
            );
          } else if (errorMessage.includes("Missing required fields")) {
            toast.error(
              "Data tidak lengkap. Silakan periksa kembali informasi pesanan."
            );
          } else {
            toast.error(errorMessage);
          }
        } else if (axiosError.response?.status === 404) {
          toast.error("Data tidak ditemukan. Silakan login ulang.");
        } else if (axiosError.response?.status === 500) {
          toast.error("Terjadi kesalahan server. Silakan coba lagi nanti.");
        } else {
          toast.error("Terjadi kesalahan tidak terduga. Silakan coba lagi.");
        }
      } else if (error && typeof error === "object" && "code" in error) {
        const networkError = error as { code?: string };
        if (networkError.code === "NETWORK_ERROR") {
          toast.error(
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
          );
        } else {
          toast.error("Terjadi kesalahan tidak terduga. Silakan coba lagi.");
        }
      } else {
        toast.error("Terjadi kesalahan tidak terduga. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <div className="mx-auto mt-8 max-w-4xl pb-10">
        {/* Price Validation Error Display */}
        {priceValidationError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <div className="text-sm">
                <div className="font-medium text-red-800 mb-2">
                  Validasi Harga Gagal
                </div>
                <p className="text-red-700 mb-2">{priceValidationError}</p>
                <p className="text-red-600 text-xs">
                  💡 Solusi: Refresh halaman ini untuk mendapatkan kalkulasi
                  harga terbaru.
                </p>
              </div>
            </div>
          </div>
        )}

        <Card
          className="shadow-lg border-0 text-gray-600"
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
                    {Object.values(tripsByDate).map((item) => (
                      <li key={format(item.date, "yyyy-MM-dd")}>
                        {formatLocalizedDate(item.date)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Display note if exists */}
              {orderData.note && orderData.note.trim() && (
                <div className="space-y-1">
                  <div className="text-gray-500 text-sm">Catatan Tambahan</div>
                  <div className="font-medium bg-gray-50 p-3 rounded-md border-l-4 border-transpo-primary">
                    {orderData.note}
                  </div>
                </div>
              )}

              {/* Price Information */}
              <div className="space-y-1 mt-2">
                <div className="text-gray-500 text-sm">Total Biaya Pesanan</div>
                {isCalculatingPrice ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-gray-500">Menghitung harga...</span>
                  </div>
                ) : (
                  <div className="font-semibold text-lg text-transpo-primary">
                    {formatRupiah(displayPrice)}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              {calculatedPrice && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Rincian Biaya
                  </h4>
                  <div className="space-y-1 text-sm">
                    {/* NEW: Show detailed per-trip breakdown */}
                    {calculatedPrice.tripBreakdown &&
                      calculatedPrice.tripBreakdown.length > 0 && (
                        <div className="mb-2">
                          <div className="font-medium text-blue-700 mb-1">
                            Biaya Per Trip/Hari:
                          </div>
                          {calculatedPrice.tripBreakdown.map((trip, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs text-blue-600 ml-2"
                            >
                              <span>
                                Hari {idx + 1} ({trip.distance.toFixed(1)} km):
                              </span>
                              <span>{formatRupiah(trip.pricePerTrip)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    <div className="flex justify-between border-t border-blue-300 pt-1">
                      <span>
                        Subtotal (Total semua trip ×{" "}
                        {calculatedPrice.vehicleCount} armada):
                      </span>
                      <span>{formatRupiah(calculatedPrice.basePrice)}</span>
                    </div>
                    {calculatedPrice.interTripCharges > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Tambahan Antar Hari:</span>
                        <span>
                          {formatRupiah(calculatedPrice.interTripCharges)}
                        </span>
                      </div>
                    )}
                    {calculatedPrice.elfOutOfMalangCharges &&
                      calculatedPrice.elfOutOfMalangCharges > 0 && (
                        <div className="flex justify-between">
                          <span>Biaya ELF Luar Malang:</span>
                          <span>
                            {formatRupiah(
                              calculatedPrice.elfOutOfMalangCharges
                            )}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between font-medium pt-2 border-t border-blue-300">
                      <span>Total:</span>
                      <span>{formatRupiah(calculatedPrice.totalPrice)}</span>
                    </div>
                  </div>

                  {/* Inter-trip Details */}
                  {calculatedPrice.breakdown.interTripDetails.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-blue-800 mb-1">
                        Detail Biaya Tambahan:
                      </h5>
                      {calculatedPrice.breakdown.interTripDetails.map(
                        (detail, idx) => (
                          <div key={idx} className="text-xs text-blue-700">
                            {detail.from.split(",")[0]} →{" "}
                            {detail.to.split(",")[0]}: {detail.distance} km
                            {detail.charge > 0 &&
                              ` (+${formatRupiah(detail.charge)})`}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Journey Details */}
            <div className="space-y-6">
              <h3 className="font-medium text-lg border-b pb-2 text-transpo-primary">
                Detail Perjalanan
              </h3>

              <div className="space-y-8">
                {Object.values(tripsByDate).map((item) => (
                  <div
                    key={format(item.date, "yyyy-MM-dd")}
                    className="space-y-4"
                  >
                    <div className="bg-gray-50 p-3 rounded-md border-l-4 border-transpo-primary">
                      <h3 className="font-medium text-transpo-primary-dark">
                        {formatLocalizedDate(item.date)}
                      </h3>
                    </div>
                    {item.trips.map((trip, tripIndex) => (
                      <div key={tripIndex} className="ml-2 space-y-4">
                        <div className="ml-4 space-y-6">
                          {trip.location.map(
                            (loc, locIndex) =>
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
                                            : locIndex ===
                                                trip.location.length - 1
                                              ? "bg-red-100 text-red-700"
                                              : "bg-gray-100 text-transpo-primary"
                                        }
                                      `}
                                    >
                                      <MapPin size={18} />
                                    </div>
                                    {locIndex < trip.location.length - 1 && (
                                      <div className="absolute top-10 left-1/2 w-0.5 h-16 bg-gray-300 -translate-x-1/2"></div>
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

                                    {/* Labels for pickup and destination */}
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {locIndex === 0 && (
                                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block border border-blue-200">
                                          <span className="font-medium">
                                            📍 Penjemputan
                                          </span>
                                        </div>
                                      )}

                                      {locIndex === trip.location.length - 1 &&
                                        trip.location.length > 1 && (
                                          <div className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded inline-block border border-red-200">
                                            <span className="font-medium">
                                              🏁 Tujuan Akhir
                                            </span>
                                          </div>
                                        )}

                                      {locIndex > 0 &&
                                        locIndex < trip.location.length - 1 && (
                                          <div className="text-xs bg-gray-50 text-gray-700 px-2 py-0.5 rounded inline-block border border-gray-200">
                                            <span className="font-medium">
                                              ⚫ Transit
                                            </span>
                                          </div>
                                        )}
                                    </div>
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
                                    Durasi: {formatDuration(trip.duration)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>{" "}
            {/* Navigation buttons */}{" "}
            <div className="flex justify-end gap-3 mt-8">
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
                disabled={isSubmitting || isCalculatingPrice}
                className="bg-transpo-primary border-transpo-primary hover:bg-transpo-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? "Memproses..." : "Buat Pesanan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          {" "}
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pemesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan membuat pesanan transportasi dengan total biaya{" "}
              {formatRupiah(displayPrice)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="text-amber-600 font-medium text-sm">
              ⚠️ Pastikan semua detail perjalanan sudah benar karena pesanan
              yang telah dibuat tidak dapat diubah.
            </div>
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <div className="text-blue-800 text-sm">
                <strong>Yang akan terjadi selanjutnya:</strong>
              </div>{" "}
              <ul className="text-blue-700 text-sm mt-1 list-disc list-inside">
                <li>Pesanan akan dibuat dengan status &quot;Pending&quot;</li>
                <li>Anda akan diarahkan ke halaman pembayaran</li>
                <li>Admin akan memverifikasi pesanan setelah pembayaran</li>
              </ul>
            </div>
          </div>
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
              className="bg-transpo-primary hover:bg-transpo-primary-dark disabled:opacity-50"
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
