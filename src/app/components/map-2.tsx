"use client";
/* eslint-disable */
import {
  useLoadScript,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import type { NextPage } from "next";
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Clock,
  EllipsisVertical,
  Flag,
  GripVertical,
  MapPin,
  Plus,
  Trash,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { toast } from "sonner";
import {
  validatePickupLocation,
  validateAngkotDestination,
  requiresAllDestinationRestriction,
} from "@/utils/validation";

export interface Location {
  id: string;
  lat: number | null;
  lng: number | null;
  address: string;
  time?: string | null;
}

export interface Trip {
  id: string;
  date?: Date;
  locations: Location[];
}

export interface DirectionInfo {
  tripId: string;
  directions: google.maps.DirectionsResult;
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
}

interface Map2Props {
  initialTrips?: Trip[];
  activeTabIndex?: number;
  onTripsChange?: (trips: Trip[]) => void;
  onDirectionsChange?: (directions: DirectionInfo[]) => void;
  showUI?: boolean;
  height?: string;
  maxLocationsPerTrip?: number;
  vehicleName?: string; // Add vehicleName prop
}

// Area centers for vehicle pickup restrictions (synchronized with backend)
const AREA_CENTERS = {
  MALANG: [
    {
      name: "Kota Malang",
      lat: -7.983908,
      lng: 112.621391,
      radius: 15000, // 15 km - untuk Angkot & ELF
    },
    {
      name: "Kabupaten Malang",
      lat: -8.16667,
      lng: 112.66667,
      radius: 50000, // 50 km - untuk Angkot & ELF (area lebih luas)
    },
  ],
  MALANG_HIACE: [
    {
      name: "Pusat Kota Malang",
      lat: -7.983908,
      lng: 112.621391,
      radius: 8000, // 8 km - hanya pusat kota untuk Hiace
    },
  ],
  SURABAYA: [
    {
      name: "Kota Surabaya",
      lat: -7.250445,
      lng: 112.768845,
      radius: 20000, // 20 km radius untuk Kota Surabaya
    },
  ],
  SURABAYA_HIACE: [
    {
      name: "Pusat Kota Surabaya",
      lat: -7.250445,
      lng: 112.768845,
      radius: 8000, // 8 km - hanya pusat kota untuk Hiace
    },
  ],
} as const;

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

// Enhanced function to check if coordinates are within Malang area using radius-based validation
const isWithinMalangArea = (lat: number, lng: number): boolean => {
  for (const center of AREA_CENTERS.MALANG) {
    const distance = calculateDistance(lat, lng, center.lat, center.lng);

    // console.log(`🔍 Distance Check for ${center.name}:`, {
    //   targetPoint: { lat, lng },
    //   center: { lat: center.lat, lng: center.lng },
    //   distance: `${(distance / 1000).toFixed(2)} km`,
    //   radius: `${(center.radius / 1000).toFixed(2)} km`,
    //   withinRadius: distance <= center.radius,
    // });

    // If point is within any of the Malang areas, return true
    if (distance <= center.radius) {
      // console.log(`✅ Location is within ${center.name}`);
      return true;
    }
  }

  // console.log("❌ Location is outside all Malang areas");
  return false;
};

// Get allowed areas for vehicle type (matching backend logic)
const getAllowedAreasForVehicle = (vehicleName: string): string[] => {
  const vehicleType = vehicleName.toLowerCase();

  if (vehicleType.includes("angkot")) {
    return ["MALANG"];
  } else if (vehicleType.includes("elf")) {
    return ["MALANG"];
  } else if (vehicleType.includes("hiace")) {
    return ["MALANG_HIACE", "SURABAYA_HIACE"]; // Both Hiace Premio and Commuter dengan area terbatas
  }

  // Default to Malang for unknown vehicle types
  return ["MALANG"];
};

// Create bounds for autocomplete based on allowed areas for the vehicle
const createBoundsForAllowedAreas = (
  allowedAreas: string[]
): google.maps.LatLngBounds => {
  const bounds = new google.maps.LatLngBounds();

  allowedAreas.forEach((areaName) => {
    const areaCenters = AREA_CENTERS[areaName as keyof typeof AREA_CENTERS];
    if (areaCenters) {
      areaCenters.forEach((center) => {
        // Add points around each center to create encompassing bounds
        const radiusInDegrees = center.radius / 111000; // Rough conversion: 1 degree ≈ 111km

        bounds.extend(
          new google.maps.LatLng(
            center.lat - radiusInDegrees,
            center.lng - radiusInDegrees
          )
        );
        bounds.extend(
          new google.maps.LatLng(
            center.lat + radiusInDegrees,
            center.lng + radiusInDegrees
          )
        );
      });
    }
  });

  return bounds;
};

// Legacy function for backward compatibility
const createMalangBounds = (): google.maps.LatLngBounds => {
  return createBoundsForAllowedAreas(["MALANG"]);
};

const SortableLocationItem = ({
  location,
  onFocus,
  onChange,
  onTimeChange,
  inputRef,
}: {
  location: Location;
  onFocus: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (time: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: location.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="grow flex flex-col gap-2">
      {/* Location input row */}
      <div className="flex items-center w-full">
        <div
          className={`invisible group-hover:visible ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="min-w-4 min-h-4 w-4 h-4" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          placeholder="Pilih destinasi"
          onFocus={onFocus}
          value={location.address}
          onChange={onChange}
          className="flex-1"
        />
      </div>

      {/* Enhanced time input row with better styling and label */}
      <div className="ml-5">
        <div className="flex items-center gap-1 mb-1">
          <Clock className="h-3.5 w-3.5 text-teal-600" />
          <span className="text-xs font-medium text-teal-700">
            Jam Kedatangan
          </span>
        </div>
        <div className="relative w-full max-w-[150px]">
          <Input
            type="time"
            value={location.time || ""}
            onChange={(e) => onTimeChange(e.target.value)}
            className="h-8 px-3 py-1 border border-gray-200 hover:border-teal-300 focus:border-teal-500 rounded-md bg-white text-sm"
            aria-label="Jam kedatangan ke lokasi"
          />
          <div className="text-[10px] text-gray-500 mt-0.5">
            Estimasi tiba di lokasi ini
          </div>
        </div>
      </div>
    </div>
  );
};

const Map2: React.FC<Map2Props> = ({
  initialTrips = [],
  activeTabIndex = 0,
  onTripsChange,
  onDirectionsChange,
  showUI = true,
  height = "100dvh",
  maxLocationsPerTrip = 10,
  vehicleName = "", // Default empty string
}) => {
  const libraries = useMemo(() => ["places"], []);
  const mapCenter = useMemo(
    () => ({ lat: -7.983908, lng: 112.621391 }), // Use Kota Malang center
    []
  );
  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: true,
    }),
    []
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries as any,
  });

  // Check if vehicle is angkot with debugging
  const isAngkot = useMemo(() => {
    const result = vehicleName.toLowerCase() === "angkot";
    // console.log("🚐 Vehicle Check:", {
    //   vehicleName,
    //   lowercased: vehicleName.toLowerCase(),
    //   isAngkot: result,
    // });
    return result;
  }, [vehicleName]);

  // Helper function to check if a location is the pickup location (first destination of first trip)
  const isPickupLocation = useCallback(
    (tripIndex: number, locationIndex: number) => {
      return tripIndex === 0 && locationIndex === 0;
    },
    []
  );

  // Check if vehicle needs area restriction (Angkot: all destinations, ELF/Hiace: pickup location only)
  const needsAreaRestriction = useCallback(
    (tripIndex: number, locationIndex: number) => {
      // For Angkot: all destinations need restriction
      if (requiresAllDestinationRestriction(vehicleName)) {
        return true;
      }

      // For other vehicles: only pickup location (first destination of first trip) needs restriction
      return isPickupLocation(tripIndex, locationIndex);
    },
    [vehicleName, isPickupLocation]
  );

  // Generate default trips if no initial trips provided
  const defaultTrips = useMemo(() => {
    return [
      {
        id: "trip-1",
        locations: [
          {
            id: `loc-1-start-${Date.now()}`,
            lat: null,
            lng: null,
            address: "",
            time: "09:00", // Default time for new locations
          },
          {
            id: `loc-1-end-${Date.now() + 1}`,
            lat: null,
            lng: null,
            address: "",
            time: "09:00", // Default time for new locations
          },
        ],
      },
    ];
  }, []);

  const [trips, setTrips] = useState<Trip[]>(
    initialTrips.length > 0 ? initialTrips : defaultTrips
  );

  const [activeTrip, setActiveTrip] = useState<number>(activeTabIndex);
  const [activeInput, setActiveInput] = useState<{
    tripIndex: number;
    locationIndex: number;
  } | null>(null);
  const [directions, setDirections] = useState<DirectionInfo[]>([]);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mapRef = useRef<google.maps.Map | null>(null);
  const renderersRef = useRef<Map<string, google.maps.DirectionsRenderer>>(
    new Map()
  );
  const autocompleteRefs = useRef<
    Record<string, google.maps.places.Autocomplete | null>
  >({});

  // Track if initial data has been loaded to prevent infinite loops
  const initialLoadDone = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update activeTrip when activeTabIndex prop changes
  useEffect(() => {
    setActiveTrip(activeTabIndex);
  }, [activeTabIndex]);

  // Update local trips when initialTrips changes, but only if they're different
  useEffect(() => {
    if (initialTrips.length > 0 && !initialLoadDone.current) {
      // console.log("🔄 Setting trips from initialTrips", initialTrips);
      setTrips(initialTrips);
      initialLoadDone.current = true;
    }
  }, [initialTrips]);

  // Notify parent component when trips change
  useEffect(() => {
    if (onTripsChange && initialLoadDone.current) {
      onTripsChange(trips);
    }
  }, [trips, onTripsChange]);

  // Notify parent component when directions change
  useEffect(() => {
    if (onDirectionsChange) {
      onDirectionsChange(directions);
    }
  }, [directions, onDirectionsChange]);
  // Validation function that uses proper area restriction logic
  const validateLocationForAreaRestriction = useCallback(
    (lat: number, lng: number, tripIndex: number, locationIndex: number) => {
      // Check if this vehicle requires all destinations to be restricted (like Angkot)
      if (requiresAllDestinationRestriction(vehicleName)) {
        // For Angkot: validate ALL destinations
        const validation = validateAngkotDestination(lat, lng);

        if (!validation.isValid) {
          toast.error(`❌ ${validation.message}`);
          return false;
        }
        return true;
      } else {
        // For other vehicles: only validate pickup location (first destination of first trip)
        if (!isPickupLocation(tripIndex, locationIndex)) {
          return true; // All other locations are unrestricted
        }

        // Use the proper validation function from utils
        const validation = validatePickupLocation(lat, lng, vehicleName);

        if (!validation.isValid) {
          toast.error(`❌ ${validation.message}`);
          return false;
        }
        return true;
      }
    },
    [vehicleName, isPickupLocation]
  );

  // Legacy validation function for backward compatibility (now only checks pickup location)
  const validateLocationForAngkot = useCallback(
    (
      lat: number,
      lng: number,
      tripIndex: number = 0,
      locationIndex: number = 0
    ) => {
      return validateLocationForAreaRestriction(
        lat,
        lng,
        tripIndex,
        locationIndex
      );
    },
    [validateLocationForAreaRestriction]
  );

  // Handle map click to set location
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || activeInput === null) return;
      const latLng = e.latLng.toJSON();

      // console.log("🗺️ Map clicked:", { latLng, activeInput });

      // Validate location for area restriction (only for pickup location)
      if (
        !validateLocationForAreaRestriction(
          latLng.lat,
          latLng.lng,
          activeInput.tripIndex,
          activeInput.locationIndex
        )
      ) {
        // Error message already shown in validation function
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const address = results[0].formatted_address;

          setTrips((prevTrips) => {
            const updatedTrips = [...prevTrips];
            if (!updatedTrips[activeInput.tripIndex]) return prevTrips;

            const updatedLocations = [
              ...updatedTrips[activeInput.tripIndex].locations,
            ];
            updatedLocations[activeInput.locationIndex] = {
              ...updatedLocations[activeInput.locationIndex],
              lat: latLng.lat,
              lng: latLng.lng,
              address,
            };
            updatedTrips[activeInput.tripIndex].locations = updatedLocations;
            return updatedTrips;
          });
        } else {
          console.error("Geocode failed:", status);
          toast.error("Gagal mendapatkan alamat lokasi");
        }
      });
    },
    [activeInput, validateLocationForAreaRestriction]
  );

  // Initialize or reinitialize autocomplete for an input
  const initializeAutocomplete = useCallback(
    (inputElement: HTMLInputElement, tripIndex: number, locIndex: number) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Places API not loaded");
        return;
      }

      try {
        // Create a unique key for this input
        const inputKey = `${tripIndex}-${locIndex}`;

        // Remove existing autocomplete if any
        if (autocompleteRefs.current[inputKey]) {
          google.maps.event.clearInstanceListeners(
            autocompleteRefs.current[inputKey]
          );
          autocompleteRefs.current[inputKey] = null;
        }

        // Configure autocomplete options based on vehicle type
        const autocompleteOptions: google.maps.places.AutocompleteOptions = {
          fields: ["geometry", "formatted_address", "place_id", "name"],
          componentRestrictions: { country: "id" }, // Restrict to Indonesia
        };

        // Only apply bounds restriction for pickup location (first destination of first trip)
        if (needsAreaRestriction(tripIndex, locIndex)) {
          const allowedAreas = getAllowedAreasForVehicle(vehicleName);
          const bounds = createBoundsForAllowedAreas(allowedAreas);

          autocompleteOptions.bounds = bounds;
          autocompleteOptions.strictBounds = true; // Enforce strict bounds for pickup location

          // console.log(
          //   `🎯 Autocomplete configured for ${vehicleName} pickup location with strict bounds:`,
          //   {
          //     allowedAreas,
          //     bounds: bounds.toJSON(),
          //     strictBounds: true,
          //     tripIndex,
          //     locIndex,
          //   }
          // );
        }

        // Create a new autocomplete instance with the right configuration
        const autocomplete = new google.maps.places.Autocomplete(
          inputElement,
          autocompleteOptions
        );

        // Store the autocomplete instance for future reference
        autocompleteRefs.current[inputKey] = autocomplete;

        // Add the place_changed event listener
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (!place.geometry || !place.geometry.location) {
            toast.error("Lokasi tidak ditemukan");
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || "";

          // console.log("📍 Autocomplete place selected:", {
          //   lat,
          //   lng,
          //   address,
          //   tripIndex,
          //   locIndex,
          //   vehicleName,
          // });

          // Validate location for area restriction (only for pickup location)
          if (
            !validateLocationForAreaRestriction(lat, lng, tripIndex, locIndex)
          ) {
            // Error message already shown in validation function
            // Clear the input
            inputElement.value = "";
            // Force blur and focus to reset autocomplete
            inputElement.blur();
            setTimeout(() => inputElement.focus(), 100);
            return;
          }

          setTrips((prevTrips) => {
            const updatedTrips = [...prevTrips];
            if (!updatedTrips[tripIndex]) return prevTrips;

            const updatedLocations = [...updatedTrips[tripIndex].locations];
            if (!updatedLocations[locIndex]) return prevTrips;

            updatedLocations[locIndex] = {
              ...updatedLocations[locIndex],
              lat,
              lng,
              address,
            };

            updatedTrips[tripIndex] = {
              ...updatedTrips[tripIndex],
              locations: updatedLocations,
            };

            return updatedTrips;
          });

          // Pan map to the selected location
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
            mapRef.current.setZoom(15);
          }
        });
      } catch (error) {
        console.error("Error initializing autocomplete:", error);
        toast.error("Gagal mengaktifkan pencarian alamat");
      }
    },
    [needsAreaRestriction, validateLocationForAreaRestriction]
  );

  // Handle input value changes
  const handleInputChange = useCallback(
    (tripIndex: number, locationIndex: number, value: string) => {
      setTrips((prevTrips) => {
        const updatedTrips = [...prevTrips];
        if (!updatedTrips[tripIndex]) return prevTrips;

        const updatedLocations = [...updatedTrips[tripIndex].locations];
        if (!updatedLocations[locationIndex]) return prevTrips;

        updatedLocations[locationIndex] = {
          ...updatedLocations[locationIndex],
          address: value,
        };
        updatedTrips[tripIndex].locations = updatedLocations;
        return updatedTrips;
      });
    },
    []
  );

  const handleTimeChange = useCallback(
    (tripIndex: number, locationIndex: number, time: string) => {
      setTrips((prevTrips) => {
        const updatedTrips = [...prevTrips];
        if (!updatedTrips[tripIndex]) return prevTrips;

        const updatedLocations = [...updatedTrips[tripIndex].locations];
        if (!updatedLocations[locationIndex]) return prevTrips;

        updatedLocations[locationIndex] = {
          ...updatedLocations[locationIndex],
          time,
        };
        updatedTrips[tripIndex].locations = updatedLocations;
        return updatedTrips;
      });
    },
    []
  );

  // Handle drag end event for locations
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setTrips((prevTrips) => {
      const updatedTrips = [...prevTrips];
      const tripIndex = prevTrips.findIndex((trip) =>
        trip.locations.some((loc) => loc.id === active.id)
      );

      if (tripIndex === -1) return prevTrips;

      const trip = prevTrips[tripIndex];
      const oldIndex = trip.locations.findIndex((loc) => loc.id === active.id);
      const newIndex = trip.locations.findIndex((loc) => loc.id === over.id);

      const newLocations = [...trip.locations];
      const [movedItem] = newLocations.splice(oldIndex, 1);
      newLocations.splice(newIndex, 0, movedItem);

      updatedTrips[tripIndex] = {
        ...trip,
        locations: newLocations,
      };

      return updatedTrips;
    });
  }, []);

  // Handle adding a new location to a trip
  const handleAddLocation = useCallback(
    (tripIndex: number) => {
      setTrips((prevTrips) => {
        const updatedTrips = [...prevTrips];
        if (!updatedTrips[tripIndex]) return prevTrips;

        const trip = updatedTrips[tripIndex];

        // Check max destinations limit
        if (
          maxLocationsPerTrip &&
          trip.locations.length >= maxLocationsPerTrip
        ) {
          toast.error(
            `Maksimal ${maxLocationsPerTrip} destinasi per perjalanan`
          );
          return prevTrips;
        }

        // Generate unique ID for the new location
        const uniqueSuffix = `${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;
        const newId = `loc-${tripIndex + 1}-${uniqueSuffix}`;

        // Add the new location
        updatedTrips[tripIndex] = {
          ...trip,
          locations: [
            ...trip.locations,
            { id: newId, lat: null, lng: null, address: "", time: "09:00" },
          ],
        };

        return updatedTrips;
      });
    },
    [maxLocationsPerTrip]
  );

  // Handle removing a location from a trip
  const handleRemoveLocation = useCallback(
    (tripIndex: number, locationIndex: number) => {
      setTrips((prevTrips) => {
        const updatedTrips = [...prevTrips];
        if (!updatedTrips[tripIndex]) return prevTrips;

        const trip = updatedTrips[tripIndex];

        // Don't allow fewer than 2 locations
        if (trip.locations.length <= 2) {
          toast.error("Minimal 2 destinasi per perjalanan");
          return prevTrips;
        }

        // Remove the location
        const newLocations = trip.locations.filter(
          (_, index) => index !== locationIndex
        );

        updatedTrips[tripIndex] = {
          ...trip,
          locations: newLocations,
        };

        return updatedTrips;
      });
    },
    []
  );

  // Handle adding a new trip
  const handleAddTrip = useCallback(() => {
    setTrips((prevTrips) => {
      const newTripId = `trip-${prevTrips.length + 1}`;
      const timestamp = Date.now();

      // Create a new trip with 2 empty locations by default
      return [
        ...prevTrips,
        {
          id: newTripId,
          locations: [
            {
              id: `loc-${prevTrips.length + 1}-start-${timestamp}`,
              lat: null,
              lng: null,
              address: "",
              time: "09:00", // Default time for new locations
            },
            {
              id: `loc-${prevTrips.length + 1}-end-${timestamp + 1}`,
              lat: null,
              lng: null,
              address: "",
              time: "09:00", // Default time for new locations
            },
          ],
        },
      ];
    });
  }, []);

  // Handle deleting a trip
  const handleDeleteTrip = useCallback((tripIndex: number) => {
    setTrips((prevTrips) => {
      if (prevTrips.length <= 1) {
        toast.error("Minimal 1 perjalanan diperlukan");
        return prevTrips;
      }
      return prevTrips.filter((_, index) => index !== tripIndex);
    });
  }, []);

  // Debounce function to limit route calculation frequency
  const debounce = <F extends (...args: any[]) => void>(
    func: F,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Format distance and duration for display
  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  // Calculate and render directions for each trip
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const directionsService = new google.maps.DirectionsService();

    // Hide all existing renderers
    renderersRef.current.forEach((renderer) => {
      renderer.setMap(null);
    });

    const calculateRoutes = debounce(async () => {
      const newDirections: DirectionInfo[] = [];

      // When using in Step2, only calculate for the active trip
      const tripsToCalculate = onTripsChange ? [trips[activeTrip]] : trips;

      for (const trip of tripsToCalculate) {
        if (!trip) continue; // Skip if trip is undefined

        const validLocations = trip.locations.filter(
          (loc) => loc.lat !== null && loc.lng !== null
        );

        if (validLocations.length < 2) {
          const renderer = renderersRef.current.get(trip.id);
          if (renderer) {
            renderer.setMap(null);
          }
          continue;
        }

        const waypoints = validLocations.slice(1, -1).map((loc) => ({
          location: { lat: loc.lat!, lng: loc.lng! },
          stopover: true,
        }));

        try {
          const result = await new Promise<google.maps.DirectionsResult>(
            (resolve, reject) => {
              directionsService.route(
                {
                  origin: {
                    lat: validLocations[0].lat!,
                    lng: validLocations[0].lng!,
                  },
                  destination: {
                    lat: validLocations[validLocations.length - 1].lat!,
                    lng: validLocations[validLocations.length - 1].lng!,
                  },
                  waypoints,
                  travelMode: google.maps.TravelMode.DRIVING,
                  optimizeWaypoints: false, // Don't optimize to maintain user order
                },
                (result, status) => {
                  if (status === google.maps.DirectionsStatus.OK && result) {
                    resolve(result);
                  } else {
                    reject(status);
                  }
                }
              );
            }
          );

          // Calculate total distance and duration
          let totalDistance = 0;
          let totalDuration = 0;
          result.routes[0].legs.forEach((leg) => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;
          });

          // Add this trip's directions to our collection
          newDirections.push({
            tripId: trip.id,
            directions: result,
            totalDistance,
            totalDuration,
          });

          // Get or create a renderer for this trip
          let renderer = renderersRef.current.get(trip.id);
          if (!renderer) {
            renderer = new google.maps.DirectionsRenderer({
              suppressMarkers: true,
              preserveViewport: true, // Don't change the map view when setting directions
            });
            renderersRef.current.set(trip.id, renderer);
          }

          // Only show renderer for the current trip or all trips if not in Step2
          if (
            (onTripsChange && trips[activeTrip]?.id === trip.id) ||
            !onTripsChange
          ) {
            renderer.setMap(mapRef.current);
            renderer.setDirections(result);
          } else {
            renderer.setMap(null);
          }
        } catch (error) {
          console.error(
            `Failed to calculate route for trip ${trip.id}:`,
            error
          );
        }
      }

      // Add all previous directions that we're not recalculating (to maintain state)
      if (onTripsChange) {
        const currentTripId = trips[activeTrip]?.id;

        // Keep existing directions for other trips that we're not currently displaying
        // This ensures we don't lose directions for other trips
        directions.forEach((dir) => {
          if (
            dir.tripId !== currentTripId &&
            !newDirections.some((nd) => nd.tripId === dir.tripId)
          ) {
            newDirections.push(dir);
          }
        });
      }

      // Update directions state without causing a re-render loop
      if (JSON.stringify(newDirections) !== JSON.stringify(directions)) {
        setDirections(newDirections);
      }
    }, 500); // Debounce for 500ms

    calculateRoutes();

    return () => {
      // Clean up on effect cleanup (component unmount or deps change)
      renderersRef.current.forEach((renderer) => {
        if (renderer) renderer.setMap(null);
      });
    };
  }, [trips, activeTrip, isLoaded, onTripsChange]);

  // Initialize autocomplete when input is focused
  useEffect(() => {
    if (activeInput && isLoaded) {
      const inputKey = `${activeInput.tripIndex}-${activeInput.locationIndex}`;
      const inputElement = inputRefs.current[inputKey];

      if (inputElement) {
        initializeAutocomplete(
          inputElement,
          activeInput.tripIndex,
          activeInput.locationIndex
        );

        // Focus the input element
        inputElement.focus();
      }
    }
  }, [activeInput, initializeAutocomplete, isLoaded]);

  // Get currently active trip to display markers
  const currentTripToShow = onTripsChange ? trips[activeTrip] : null;

  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return (
    <div className="flex flex-col h-full">
      <div className="h-[400px] w-full">
        <GoogleMap
          options={mapOptions}
          zoom={11}
          center={mapCenter}
          onClick={handleMapClick}
          mapContainerStyle={{ height: "100%", width: "100%" }}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          {/* Show markers only for the active trip when using in Step2 */}
          {onTripsChange
            ? // When in Step2, only show markers for active trip
              currentTripToShow &&
              currentTripToShow.locations.map(
                (location, locIndex) =>
                  location.lat !== null &&
                  location.lng !== null && (
                    <Marker
                      key={`active-${locIndex}`}
                      position={{ lat: location.lat, lng: location.lng }}
                      label={`${locIndex + 1}`}
                      onClick={() => {
                        setActiveInput({
                          tripIndex: activeTrip,
                          locationIndex: locIndex,
                        });
                      }}
                    />
                  )
              )
            : // When not in Step2, show all trips' markers
              trips.map((trip, tripIndex) =>
                trip.locations.map(
                  (location, locIndex) =>
                    location.lat !== null &&
                    location.lng !== null && (
                      <Marker
                        key={`${tripIndex}-${locIndex}`}
                        position={{ lat: location.lat, lng: location.lng }}
                        label={`${locIndex + 1}`}
                        onClick={() => {
                          setActiveInput({
                            tripIndex,
                            locationIndex: locIndex,
                          });
                        }}
                      />
                    )
                )
              )}
        </GoogleMap>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-lg flex flex-col mt-4 max-h-96 overflow-y-auto">
        <div className="pt-4 px-6 flex-shrink-0">
          <div className="text-lg font-semibold">Inisiasi perjalanan</div>
          <p className="text-xs text-muted-foreground">
            {requiresAllDestinationRestriction(vehicleName)
              ? `🚐 Klik input lalu pilih lokasi di peta atau ketik manual. ${vehicleName} memiliki pembatasan area untuk SEMUA destinasi.`
              : needsAreaRestriction(0, 0)
                ? `🚐 Klik input lalu pilih lokasi di peta atau ketik manual. ${vehicleName} memiliki pembatasan area untuk lokasi penjemputan (destinasi pertama).`
                : "Klik input lalu pilih lokasi di peta atau ketik manual. Tarik & lepas untuk mengubah urutan."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 mt-2">
          <Accordion
            type="single"
            collapsible
            defaultValue={"item-" + activeTrip}
            className="gap-y-2 w-full"
          >
            {trips.map((trip, tripIndex) => {
              const tripDirections = directions.find(
                (d) => d.tripId === trip.id
              );

              // Only show the active trip's panel when used in Step2
              if (onTripsChange && tripIndex !== activeTrip) {
                return null;
              }

              return (
                <AccordionItem
                  key={trip.id}
                  value={`item-${tripIndex}`}
                  className="border-b-0"
                >
                  <AccordionTrigger className="items-center px-4 hover:[box-shadow:rgba(99,_99,_99,_0.2)_0px_2px_8px_0px] rounded-2xl">
                    <div>
                      <small className="text-sm font-medium leading-none">
                        Trip {tripIndex + 1}
                        {trip.date && ` - ${trip.date.toLocaleDateString()}`}
                      </small>
                      <p className="text-xs text-muted-foreground">
                        {
                          trip.locations.filter(
                            (loc) => loc.lat !== null && loc.lng !== null
                          ).length
                        }{" "}
                        dari {trip.locations.length} destinasi dipilih
                      </p>
                      {tripDirections && (
                        <p className="text-xs text-muted-foreground">
                          Jarak: {formatDistance(tripDirections.totalDistance)}{" "}
                          | Waktu:{" "}
                          {formatDuration(tripDirections.totalDuration)}
                        </p>
                      )}
                    </div>

                    {!onTripsChange && (
                      <div
                        title="Hapus trip"
                        className="p-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(tripIndex);
                        }}
                      >
                        <Trash className="w-4 h-4" color="#DC2626" />
                      </div>
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="py-1.5 px-4 overflow-visible">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={trip.locations.map((loc) => loc.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {trip.locations.map((location, locationIndex) => (
                          <React.Fragment key={location.id}>
                            <div className="flex items-center w-full group mb-4">
                              {" "}
                              {/* Increased margin-bottom */}
                              {locationIndex === 0 ? (
                                <MapPin
                                  color="#DC362E"
                                  className="min-w-4 min-h-4 w-4 h-4 mr-1 self-start mt-2" // Added self-start alignment
                                />
                              ) : locationIndex ===
                                trip.locations.length - 1 ? (
                                <Flag
                                  color="#DC362E"
                                  className="min-w-4 min-h-4 w-4 h-4 mr-1 self-start mt-2" // Added self-start alignment
                                />
                              ) : (
                                <span className="min-w-4 min-h-4 w-4 h-4 text-[10px] text-center font-medium border border-black rounded-full mr-1 self-start mt-2">
                                  {" "}
                                  {/* Added self-start alignment */}
                                  {locationIndex}
                                </span>
                              )}
                              <SortableLocationItem
                                key={location.id}
                                location={location}
                                onFocus={() =>
                                  setActiveInput({
                                    tripIndex,
                                    locationIndex,
                                  })
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    tripIndex,
                                    locationIndex,
                                    e.target.value
                                  )
                                }
                                onTimeChange={(time) =>
                                  handleTimeChange(
                                    tripIndex,
                                    locationIndex,
                                    time
                                  )
                                }
                                inputRef={(el) => {
                                  inputRefs.current[
                                    `${tripIndex}-${locationIndex}`
                                  ] = el;
                                }}
                              />
                              {trip.locations.length > 2 && (
                                <button
                                  title="Hapus lokasi"
                                  className="pl-2 py-2 cursor-pointer self-start mt-2" // Added self-start alignment
                                  onClick={() =>
                                    handleRemoveLocation(
                                      tripIndex,
                                      locationIndex
                                    )
                                  }
                                >
                                  <Trash className="w-4 h-4" color="#DC2626" />
                                </button>
                              )}
                            </div>

                            {locationIndex !== trip.locations.length - 1 && (
                              <div className="mr-auto mb-2">
                                <EllipsisVertical
                                  strokeWidth={1}
                                  className="min-w-4 min-h-4 w-4 h-4"
                                />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </SortableContext>
                    </DndContext>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <div className="p-4 bg-white border-t flex-shrink-0">
          {!onTripsChange ? (
            <Button
              onClick={handleAddTrip}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah perjalanan
            </Button>
          ) : (
            <Button
              disabled={
                !!maxLocationsPerTrip &&
                trips[activeTrip]?.locations.length >= maxLocationsPerTrip
              }
              size="sm"
              variant="outline"
              onClick={() => handleAddLocation(activeTrip)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah destinasi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map2;
