"use client";

import React, { FC } from "react";
import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import MapHandler from "./map-handler";
import PlaceAutocomplete from "./place-auto-complete";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

interface MapContainerProps {
  selectedPlace: google.maps.places.PlaceResult | null;
  setSelectedPlace: React.Dispatch<
    React.SetStateAction<google.maps.places.PlaceResult | null>
  >;
  selectedDestinations: { lat: number; lng: number }[];
}

const MapContainer: FC<MapContainerProps> = ({
  selectedPlace,
  setSelectedPlace,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  return (
    <APIProvider
      apiKey={API_KEY}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
    >
      <Map
        mapId={"bf51a910020fa25a"}
        defaultZoom={3}
        onClick={(e) => console.log({ e })}
        defaultCenter={{ lat: 22.54992, lng: 0 }}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      >
        <AdvancedMarker ref={markerRef} position={null} />
      </Map>
      <div className="mx-auto">
        <MapControl position={ControlPosition.TOP}>
          <div className="autocomplete-control ">
            <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
          </div>
        </MapControl>
      </div>
      <MapHandler place={selectedPlace} marker={marker} />
    </APIProvider>
  );
};

export default MapContainer;
