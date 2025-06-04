"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

const PlaceAutocomplete = ({ onPlaceSelect }: Props) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address"],
    };

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      options
    );
    setPlaceAutocomplete(autocomplete);

    return () => {
      // Clean up event listeners if needed
      window.google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;
    const listener = placeAutocomplete.addListener("place_changed", () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container p-4 bg-white rounded-lg text-xl flex justify-center w-[50rem] mx-auto mt-4">
      <input
        className="outline-none w-full"
        ref={inputRef}
        placeholder="Search for a destination"
      />
    </div>
  );
};

export default PlaceAutocomplete;
