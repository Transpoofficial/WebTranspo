"use client";

import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
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

interface Location {
  id: string; // Add unique identifier for sortable items
  lat: number;
  lng: number;
  address: string;
}

interface Trip {
  id: string; // Add unique identifier for trips
  locations: Location[];
}

// Create a sortable item component
const SortableLocationItem = ({
  location,
  onFocus,
  onChange,
  inputRef,
}: {
  location: Location;
  onFocus: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    <div ref={setNodeRef} style={style} className="grow flex items-center">
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
      />
    </div>
  );
};

const Map2: NextPage = () => {
  const libraries = useMemo(() => ["places"], []);
  const mapCenter = useMemo(
    () => ({ lat: -7.966913168381078, lng: 112.63315537047333 }),
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
    libraries: libraries as ("places" | "geometry" | "drawing" | "visualization")[],
  });

  // Initialize with unique IDs
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: "trip-1",
      locations: [
        {
          id: `loc-1-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lat: 0,
          lng: 0,
          address: "",
        },
        {
          id: `loc-1-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lat: 0,
          lng: 0,
          address: "",
        },
      ],
    },
  ]);
  const [activeInput, setActiveInput] = useState<{
    tripIndex: number;
    locationIndex: number;
  } | null>(null);

  console.log(trips);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Set up sensors for drag and drop
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

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || activeInput === null) return;
      const latLng = e.latLng.toJSON();

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const address = results[0].formatted_address;
          setTrips((prevTrips) => {
            const updatedTrips = [...prevTrips];
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
        }
      });
    },
    [activeInput]
  );

  const initializeAutocomplete = useCallback(
    (inputElement: HTMLInputElement, tripIndex: number, locIndex: number) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        return;
      }

      const autocomplete = new google.maps.places.Autocomplete(inputElement);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();

        if (lat && lng) {
          setTrips((prevTrips) => {
            const updatedTrips = [...prevTrips];
            updatedTrips[tripIndex] = {
              ...updatedTrips[tripIndex],
              locations: updatedTrips[tripIndex].locations.map((loc, index) =>
                index === locIndex
                  ? { ...loc, lat, lng, address: place.formatted_address || "" }
                  : loc
              ),
            };
            return updatedTrips;
          });
        }
      });
    },
    []
  );

  const handleInputChange = useCallback(
    (tripIndex: number, locationIndex: number, value: string) => {
      setTrips((prevTrips) => {
        const updatedTrips = [...prevTrips];
        const updatedLocations = [...updatedTrips[tripIndex].locations];
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

  // Handle drag end event
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setTrips((prevTrips) => {
      const updatedTrips = [...prevTrips];

      // Find which trip contains this location
      const tripIndex = prevTrips.findIndex((trip) =>
        trip.locations.some((loc) => loc.id === active.id)
      );

      if (tripIndex === -1) return prevTrips;

      const trip = prevTrips[tripIndex];
      const oldIndex = trip.locations.findIndex((loc) => loc.id === active.id);
      const newIndex = trip.locations.findIndex((loc) => loc.id === over.id);

      // Create a new locations array with reordered items
      const newLocations = [...trip.locations];
      const [movedItem] = newLocations.splice(oldIndex, 1);
      newLocations.splice(newIndex, 0, movedItem);

      // Update the trip with new locations
      updatedTrips[tripIndex] = {
        ...trip,
        locations: newLocations,
      };

      return updatedTrips;
    });
  }, []);

  // Add a new location to a trip
  const handleAddLocation = useCallback((tripIndex: number) => {
    setTrips((prevTrips) => {
      const updatedTrips = [...prevTrips];
      const trip = updatedTrips[tripIndex];

      // Generate a more unique ID using timestamp and random number
      const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newId = `loc-${tripIndex + 1}-${uniqueSuffix}`;

      updatedTrips[tripIndex] = {
        ...trip,
        locations: [
          ...trip.locations,
          { id: newId, lat: 0, lng: 0, address: "" },
        ],
      };

      return updatedTrips;
    });
  }, []);

  // Remove a location from a trip
  const handleRemoveLocation = useCallback(
    (tripIndex: number, locationIndex: number) => {
      setTrips((prevTrips) => {
        const updatedTrips = [...prevTrips];
        const trip = updatedTrips[tripIndex];

        // Don't allow removing if there are only 2 locations (start and end)
        if (trip.locations.length <= 2) return prevTrips;

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

  // Add a new trip
  const handleAddTrip = useCallback(() => {
    setTrips((prevTrips) => {
      const newTripId = `trip-${prevTrips.length + 1}`;

      return [
        ...prevTrips,
        {
          id: newTripId,
          locations: [
            {
              id: `loc-${prevTrips.length + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              lat: 0,
              lng: 0,
              address: "",
            },
            {
              id: `loc-${prevTrips.length + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              lat: 0,
              lng: 0,
              address: "",
            },
          ],
        },
      ];
    });
  }, []);

  // Delete a trip
  const handleDeleteTrip = useCallback((tripIndex: number) => {
    setTrips((prevTrips) =>
      prevTrips.filter((_, index) => index !== tripIndex)
    );
  }, []);

  useEffect(() => {
    if (activeInput && isLoaded) {
      const inputElement =
        inputRefs.current[
          `${activeInput.tripIndex}-${activeInput.locationIndex}`
        ];
      if (inputElement) {
        initializeAutocomplete(
          inputElement,
          activeInput.tripIndex,
          activeInput.locationIndex
        );
      }
    }
  }, [activeInput, initializeAutocomplete, isLoaded]);

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="relative">
      <GoogleMap
        options={mapOptions}
        zoom={12}
        center={mapCenter}
        mapContainerStyle={{ width: "100%", height: "100dvh" }}
        onClick={handleMapClick}
      >
        {trips.map((trip, tripIndex) =>
          trip.locations.map(
            (location, locIndex) =>
              location.lat !== 0 &&
              location.lng !== 0 && (
                <Marker
                  key={`${tripIndex}-${locIndex}`}
                  position={{ lat: location.lat, lng: location.lng }}
                  label={`${locIndex + 1}`}
                  animation={google.maps.Animation.DROP}
                  onClick={() => {
                    setActiveInput({ tripIndex, locationIndex: locIndex });
                  }}
                />
              )
          )
        )}
      </GoogleMap>

      <div className="absolute top-4 left-4 z-10 max-w-sm">
        <div className="bg-white rounded-xl shadow-lg pb-4">
          <div className="pt-4 px-6">
            <div className="text-lg font-semibold">Inisiasi perjalanan</div>
            <p className="text-xs text-muted-foreground">
              Klik input lalu pilih lokasi di peta atau ketik manual. Tarik &
              lepas untuk mengubah urutan.
            </p>
          </div>

          <div className="flex flex-col gap-y-0.5 px-2 mt-2">
            <Accordion type="single" collapsible className="gap-y-2 w-full">
              {trips.map((trip, tripIndex) => (
                <AccordionItem key={trip.id} value={`item-${tripIndex}`}>
                  <AccordionTrigger className="items-center px-4 hover:[box-shadow:rgba(99,_99,_99,_0.2)_0px_2px_8px_0px] rounded-2xl">
                    <div>
                      <small className="text-sm font-medium leading-none">
                        Trip {tripIndex + 1}
                      </small>
                      <p className="text-xs text-muted-foreground">
                        {
                          trip.locations.filter(
                            (loc) => loc.lat !== 0 && loc.lng !== 0
                          ).length
                        }{" "}
                        dari {trip.locations.length} destinasi dipilih
                      </p>
                    </div>

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
                  </AccordionTrigger>
                  <AccordionContent className="py-1.5 px-4">
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
                          <React.Fragment key={locationIndex}>
                            <div className="flex items-center w-full group">
                              {locationIndex === 0 ? (
                                <MapPin
                                  color="#DC362E"
                                  className="min-w-4 min-h-4 w-4 h-4"
                                />
                              ) : locationIndex ===
                                trip?.locations.length - 1 ? (
                                <Flag
                                  color="#DC362E"
                                  className="min-w-4 min-h-4 w-4 h-4"
                                />
                              ) : (
                                <span className="min-w-4 min-h-4 w-4 h-4 text-[10px] text-center font-medium border border-black rounded-full">
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
                                inputRef={(el) => {
                                  inputRefs.current[
                                    `${tripIndex}-${locationIndex}`
                                  ] = el;
                                }}
                              />

                              {trip.locations.length > 2 && (
                                <button
                                  title="Hapus lokasi"
                                  className="pl-2 py-2 cursor-pointer"
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

                            {locationIndex !== trip?.locations.length - 1 && (
                              <div className="mr-auto">
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

                    <div className="flex gap-2 mt-4">
                      <Button
                        disabled={trip.locations.length >= 10}
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddLocation(tripIndex)}
                        className="flex-1"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah destinasi
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button
              onClick={handleAddTrip}
              variant="outline"
              className="mt-4 mx-4"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah perjalanan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map2;
