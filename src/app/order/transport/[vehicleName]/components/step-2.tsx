"use client";

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import axios from "axios";
import { OrderData } from "../page";
import Map2, { Trip, DirectionInfo, Location } from "@/app/components/map-2";
import { useParams } from "next/navigation";
import DOMPurify from "dompurify";

interface Step2Props {
  orderData: OrderData;
  setOrderData: React.Dispatch<React.SetStateAction<any>>;
  onContinue: () => void;
  onBack: () => void;
}

const MAX_DESTINATIONS_PER_TRIP = 10;
const MAX_NOTE_LENGTH = 500;

const Step2 = ({ orderData, setOrderData, onBack, onContinue }: Step2Props) => {
  const params = useParams();
  const vehicleName = decodeURIComponent(
    Array.isArray(params.vehicleName)
      ? params.vehicleName[0]
      : params.vehicleName || ""
  );

  const [trips, setTrips] = useState<Trip[]>([]);
  const [directions, setDirections] = useState<DirectionInfo[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [note, setNote] = useState(orderData.note || "");
  const initialLoadRef = useRef(true);
  const directionLoadedRef = useRef(false);
  const mapStateRef = useRef<{
    trips: Trip[];
    directions: DirectionInfo[];
  }>({
    trips: [],
    directions: [],
  });

  // Format date for display (e.g. "Senin, 05 Mei 2025")
  const formatLocalizedDate = (date: Date) => {
    return format(date, "EEEE, dd MMMM yyyy", { locale: id });
  };

  // Format distance for display
  const formatDistance = (meters: number) => {
    if (!meters) return "0 km";
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0 menit";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  // ✅ Helper function to sanitize note input
  const sanitizeNote = (input: string): string => {
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

  // ✅ Handle note input changes
  const handleNoteChange = (value: string) => {
    // Limit character count
    if (value.length > MAX_NOTE_LENGTH) {
      toast.error(`Catatan maksimal ${MAX_NOTE_LENGTH} karakter`);
      return;
    }

    // Real-time sanitization
    const sanitized = value.replace(/[<>]/g, "");
    setNote(sanitized);

    // Update orderData in real-time
    setOrderData((prev: OrderData) => ({
      ...prev,
      note: sanitized,
    }));
  };

  // ✅ Initialize note from orderData
  useEffect(() => {
    if (orderData.note && orderData.note !== note) {
      setNote(orderData.note);
    }
  }, [orderData.note]);

  // Create initial directions based on orderData when returning to step 2
  const createInitialDirectionsFromOrderData = () => {
    if (!orderData.trip) return [];

    const initialDirections: DirectionInfo[] = [];

    orderData.trip.forEach((trip, idx) => {
      // Only add if trip has a distance value and at least 2 locations
      if (trip.distance && trip.location.length >= 2) {
        initialDirections.push({
          tripId: `trip-${idx + 1}`,
          directions: {} as google.maps.DirectionsResult, // This will be repopulated by the map
          totalDistance: trip.distance,
          totalDuration: trip.duration || 0,
        });
      }
    });

    return initialDirections;
  };

  // Initialize trips based on orderData.trip
  useEffect(() => {
    if (initialLoadRef.current && orderData.trip && orderData.trip.length > 0) {
      // Convert orderData.trip to the format expected by Map2
      const newTrips = orderData.trip.map((dest, idx) => {
        const tripId = `trip-${idx + 1}`;

        // Generate locations from orderData
        let locations: Location[] = [];

        if (dest.location.length >= 2) {
          // If we have 2+ locations from orderData, use them
          locations = dest.location.map((loc, locIdx) => ({
            id: `loc-${idx}-${locIdx}-${Date.now() + locIdx}`,
            lat: loc.lat,
            lng: loc.lng,
            address: loc.address || "",
            time: loc.time || null, // Include time value
          }));
        } else {
          // Otherwise create default 2 empty locations
          locations = [
            {
              id: `loc-${idx}-start-${Date.now()}`,
              lat: null,
              lng: null,
              address: "",
              time: null,
            },
            {
              id: `loc-${idx}-end-${Date.now() + 1}`,
              lat: null,
              lng: null,
              address: "",
              time: null,
            },
          ];
        }

        return {
          id: tripId,
          date: dest.date,
          locations: locations,
        };
      });

      setTrips(newTrips);

      // Save the initial trips to the ref to persist state
      mapStateRef.current.trips = newTrips;

      // Restore directions data from orderData if available
      if (!directionLoadedRef.current) {
        const initialDirections = createInitialDirectionsFromOrderData();
        if (initialDirections.length > 0) {
          setDirections(initialDirections);
          mapStateRef.current.directions = initialDirections;
          directionLoadedRef.current = true;
        }
      }

      initialLoadRef.current = false;
    }
  }, [orderData.trip]);

  // Handle trip changes from Map2 component
  const handleTripsChange = React.useCallback((updatedTrips: Trip[]) => {
    if (!updatedTrips || updatedTrips.length === 0) return;

    setTrips((current) => {
      // Check if we'd exceed the maximum number of destinations
      const hasExceededLimit = updatedTrips.some(
        (trip) => trip.locations.length > MAX_DESTINATIONS_PER_TRIP
      );

      if (hasExceededLimit) {
        toast.error(
          `Maksimal ${MAX_DESTINATIONS_PER_TRIP} destinasi per perjalanan`
        );
        return current;
      }

      // Update the trips
      mapStateRef.current.trips = updatedTrips;
      return updatedTrips;
    });
  }, []);

  // Handle directions changes from Map2 component
  const handleDirectionsChange = React.useCallback(
    (updatedDirections: DirectionInfo[]) => {
      if (!updatedDirections) return;

      // Store updated directions
      setDirections(updatedDirections);
      mapStateRef.current.directions = updatedDirections;

      // Mark directions as loaded
      directionLoadedRef.current = true;

      // Update orderData with new directions information
      setOrderData((prev: OrderData) => {
        const updatedTrip = [...prev.trip];

        updatedDirections.forEach((direction) => {
          const tripIndex = trips.findIndex(
            (trip) => trip.id === direction.tripId
          );
          if (tripIndex >= 0 && updatedTrip[tripIndex]) {
            updatedTrip[tripIndex] = {
              ...updatedTrip[tripIndex],
              distance: direction.totalDistance,
              duration: direction.totalDuration,
            };
          }
        });

        // Calculate total distance by summing all trip distances
        const totalDistance = updatedTrip.reduce(
          (sum, trip) => sum + (trip.distance || 0),
          0
        );

        return {
          ...prev,
          trip: updatedTrip,
          totalDistance: totalDistance,
          totalDuration: updatedTrip.reduce(
            (sum, trip) => sum + (trip.duration || 0),
            0
          ),
        };
      });
    },
    [trips, setOrderData]
  );

  // Update orderData when continuing
  const handleContinue = async () => {
    // Validate that each trip has at least 2 locations
    const invalidTrips = trips.filter((trip) => {
      const validLocations = trip.locations.filter(
        (loc) => loc.lat !== null && loc.lng !== null && loc.address
      );
      return validLocations.length < 2;
    });

    if (invalidTrips.length > 0) {
      toast.error("Setiap perjalanan harus memiliki minimal 2 destinasi");
      return;
    }

    // Convert trips data back to orderData.trip format
    const updatedTrip = trips.map((trip, idx) => {
      // Filter out invalid locations
      const validLocations = trip.locations.filter(
        (loc) => loc.lat !== null && loc.lng !== null && loc.address
      );

      const tripDirections = directions.find((d) => d.tripId === trip.id);

      return {
        date: trip.date!,
        location: validLocations.map((loc) => ({
          lat: loc.lat,
          lng: loc.lng,
          address: loc.address,
          time: loc.time || null, // Include time value
        })),
        startTime: orderData.trip[idx]?.startTime || "",
        distance:
          tripDirections?.totalDistance || orderData.trip[idx]?.distance || 0,
        duration:
          tripDirections?.totalDuration || orderData.trip[idx]?.duration || 0,
      };
    });

    // Calculate total distance by summing all trip distances
    const totalDistance = updatedTrip.reduce(
      (sum, trip) => sum + (trip.distance || 0),
      0
    );
    const totalDuration = updatedTrip.reduce(
      (sum, trip) => sum + (trip.duration || 0),
      0
    );

    // ✅ Final sanitization of note before saving
    const finalNote = sanitizeNote(note);

    // Update orderData
    setOrderData((prev: OrderData) => ({
      ...prev,
      trip: updatedTrip,
      totalDistance,
      totalDuration,
      note: finalNote, // ✅ Include sanitized note
    }));

    // Calculate price via API
    try {
      const response = await axios.post("/api/calculate-price", {
        vehicleTypeId: orderData.vehicleTypeId,
        totalDistance: totalDistance,
        vehicleCount: orderData.userData.totalVehicles || 1,
      });

      if (response.status === 200) {
        setOrderData((prev: OrderData) => ({
          ...prev,
          totalPrice: response.data.data.totalPrice,
        }));
      } else {
        toast.error("Failed to calculate price. Using estimate instead.");
        const estimatedPrice = totalDistance * 1000 + 150000;
        setOrderData((prev: OrderData) => ({
          ...prev,
          totalPrice: estimatedPrice,
        }));
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      toast.error("Failed to calculate price. Using estimate instead.");
      const estimatedPrice = totalDistance * 1000 + 150000;
      setOrderData((prev: OrderData) => ({
        ...prev,
        totalPrice: estimatedPrice,
      }));
    }

    // Move to next step
    onContinue();
  };

  return (
    <div className="mx-auto mt-8 max-w-full pb-10">
      <Card
        className="border-none"
        style={{ boxShadow: "0 5px 35px rgba(0, 0, 0, 0.2)" }}
      >
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-700">
            JADWAL PERJALANAN
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel - Trip list */}
          <div className="md:col-span-1 space-y-4">
            <div className="font-medium text-lg">Perjalanan Kamu</div>

            {trips.map((trip, idx) => {
              // Get the actual distance and duration from orderData
              const tripDistance = orderData.trip[idx]?.distance || 0;
              const tripDuration = orderData.trip[idx]?.duration || 0;

              return (
                <div
                  key={trip.id}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer",
                    activeTabIndex === idx
                      ? "border-transpo-primary"
                      : "border-gray-200"
                  )}
                  onClick={() => setActiveTabIndex(idx)}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon
                      className="text-transpo-primary border-transpo-primary"
                      size={18}
                    />
                    <span>
                      {trip.date ? formatLocalizedDate(trip.date) : "No date"}
                    </span>
                  </div>
                  {(tripDistance > 0 || tripDuration > 0) && (
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Jarak: {formatDistance(tripDistance)}</div>
                      <div>Estimasi: {formatDuration(tripDuration)}</div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Summary for all trips */}
            {orderData.totalDistance > 0 && (
              <div className="bg-transpo-primary/10 border border-transpo-primary/30 rounded-lg p-4">
                <div className="font-medium text-teal-800">
                  Total Perjalanan
                </div>
                <div className="mt-1 text-teal-700">
                  <div>Jarak: {formatDistance(orderData.totalDistance)}</div>
                </div>
              </div>
            )}

            {/* ✅ Note Input Field */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <Label
                htmlFor="note"
                className="font-medium text-gray-700 mb-2 block"
              >
                Catatan Tambahan (Opsional)
              </Label>
              <Textarea
                id="note"
                placeholder="Tambahkan catatan khusus untuk perjalanan Anda..."
                className="bg-white border-gray-200 focus-visible:ring-transpo-primary text-gray-900 placeholder:text-gray-400 resize-none"
                rows={4}
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                maxLength={MAX_NOTE_LENGTH}
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {note.length}/{MAX_NOTE_LENGTH} karakter
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <span className="font-medium">Contoh:</span> Butuh kursi roda,
                ada bayi, pick up pagi-pagi, dll.
              </div>
            </div>

            {/* Warning message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                <div className="text-sm">
                  <div className="font-medium text-amber-800">
                    Catatan Penting: Batas Tambahan Perjalanan
                  </div>
                  <p className="text-amber-700 mt-1">
                    {vehicleName.toLowerCase() === "angkot" ? (
                      <>
                        Angkot hanya tersedia di area Malang Kota dan Kabupaten.
                        <br />
                        Jika ingin menambah/mengurangi hari perjalanan:
                      </>
                    ) : (
                      "Jika ingin menambah/mengurangi hari perjalanan:"
                    )}
                    <ul className="list-disc ml-4 mt-1">
                      <li>Klik tombol Kembali</li>
                      <li>Tambah/kurangi tanggal di step sebelumnya</li>
                      <li>Satu tanggal = satu hari perjalanan</li>
                      <li>
                        Maksimal {MAX_DESTINATIONS_PER_TRIP} destinasi per hari
                      </li>
                      {vehicleName.toLowerCase() === "angkot" && (
                        <li>Area terbatas: Malang Kota dan Kabupaten</li>
                      )}
                    </ul>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Map2 component */}
          <div className="md:col-span-2 h-[500px] border border-gray-200 rounded-lg overflow-hidden">
            {!initialLoadRef.current && (
              <Map2
                key={`map-instance-${trips.length}-${activeTabIndex}`}
                initialTrips={
                  mapStateRef.current.trips.length > 0
                    ? mapStateRef.current.trips
                    : trips
                }
                activeTabIndex={activeTabIndex}
                onTripsChange={handleTripsChange}
                onDirectionsChange={handleDirectionsChange}
                maxLocationsPerTrip={MAX_DESTINATIONS_PER_TRIP}
                height="500px"
                vehicleName={vehicleName} // Pass vehicleName to Map2
              />
            )}
          </div>
        </CardContent>
        {/* Navigation buttons */}
        <div className="flex justify-end gap-3 mt-6 mr-4">
          <Button
            onClick={onBack}
            variant="secondary"
            className="border-gray-300 hover:bg-gray-100 text-gray-700"
          >
            Kembali
          </Button>
          <Button
            onClick={handleContinue}
            className="bg-transpo-primary border-transpo-primary hover:bg-transpo-primary-dark"
          >
            Selanjutnya
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Step2;
