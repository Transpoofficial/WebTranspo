import React, { FC, useMemo } from "react";
import { GoogleMap, useLoadScript, Polyline } from "@react-google-maps/api";
import { decode } from "@googlemaps/polyline-codec";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: -7.95,
  lng: 112.63,
};

interface RouteMapProps {
  polyline: string | null;
  totalDistance: number | null;
  totalDuration: number | null;
}

const RouteMap: FC<RouteMapProps> = ({
  polyline,
  totalDistance,
  totalDuration,
}) => {
  return (
    <div>
      {polyline && totalDistance && totalDuration && (
        <CustomPolyline
          totalDistance={totalDistance}
          totalDuration={totalDuration}
          polyline={polyline}
        />
      )}
    </div>
  );
};

const CustomPolyline = ({
  polyline,
  totalDistance,
  totalDuration,
}: {
  polyline: string;
  totalDistance: number;
  totalDuration: number;
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "", // Ganti dengan API key kamu
  });

  const decodedPath = useMemo(() => {
    if (!polyline) return [];
    return decode(polyline).map(([lat, lng]) => ({ lat, lng }));
  }, [polyline]);

  if (!isLoaded) return <p>Loading maps...</p>;
  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
      >
        {decodedPath.length > 0 && (
          <Polyline
            path={decodedPath}
            options={{
              strokeColor: "#0ea5e9", // Tailwind sky-500
              strokeOpacity: 0.8,
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>
      <div className="mt-4 flex flex-col gap-2">
        <div>
          <span className="font-semibold">Total Distance:</span>{" "}
          {(totalDistance / 1000).toFixed(2)} km
        </div>
        <div>
          <span className="font-semibold">Total Duration:</span>{" "}
          {(totalDuration / 60).toFixed(0)} min
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
