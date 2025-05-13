"use client";

import React, { useEffect, useState } from "react";
import MapContainer from "./components/map-container";
import RouteMap from "./components/route-map";

const MapPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<
    { lat: number; lng: number; name: string }[]
  >([]);
  console.log({ selectedDestinations });
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) return null;
  console.log({ selectedPlace });
  console.log({ selectedDestinations });

  const handleAddLocation = () => {
    console.log({ selectedPlace });
    if (!selectedPlace) return;
    const latLng = selectedPlace.geometry?.location;
    const lat =
      typeof latLng?.lat === "function" ? latLng?.lat() : Number(latLng?.lat);
    const lng =
      typeof latLng?.lng === "function" ? latLng?.lng() : Number(latLng?.lng);
    const newLocation = { lat, lng, name: selectedPlace.name ?? "" };

    if (
      selectedDestinations.some(
        (loc) => loc.lat === newLocation.lat && loc.lng === newLocation.lng
      )
    ) {
      return;
    }
    if (selectedDestinations.length >= 10) return;

    setSelectedDestinations((prev) => {
      const newLocations = [...prev, newLocation];
      return newLocations;
    });
  };

  const handleCalculateDistance = async () => {
    console.log("Calculating distance...");
    // Get waypoints (all destinations except first and last)
    const waypoints = selectedDestinations
      .slice(1, -1)
      .map((loc) => `${loc.lat},${loc.lng}`)
      .join("|");

    const origin = `${selectedDestinations[0].lat},${selectedDestinations[0].lng}`;
    const destination = `${
      selectedDestinations[selectedDestinations.length - 1].lat
    },${selectedDestinations[selectedDestinations.length - 1].lng}`;
  };

  return (
    <main className="w-11/12 md:w-3/4 mx-auto flex flex-col gap-4">
      <div className=" h-[60dvh] relative">
        <MapContainer
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
          selectedDestinations={selectedDestinations}
        />
        <div className="absolute bottom-10 right-10 flex flex-col gap-4">
          <ul className="bg-white rounded-lg">
            {selectedDestinations.map((location, index) => (
              <li key={index} className="p-4 shadow-md">
                <h5 className="font-semibold">
                  Destination {index + 1}: {location.name}
                </h5>
                <p>
                  Lat: {location.lat}, Lng: {location.lng}
                </p>
              </li>
            ))}
            {selectedDestinations.length === 0 && (
              <li className="bg-white p-4 rounded-lg w-full">
                <h5 className="font-bold">No Destinations Added</h5>
              </li>
            )}
          </ul>
          <button
            className="bg-sky-500 hover:bg-sky-400 transition-colors cursor-pointer px-4 py-2 rounded-lg text-white w-full"
            onClick={handleAddLocation}
          >
            Add Destination
          </button>
        </div>
      </div>
      <RouteMap calculateDistance={handleCalculateDistance} />
    </main>
  );
};

export default MapPage;
