import React, { FC } from "react";

interface RouteMapProps {
  calculateDistance: () => void;
}

const RouteMap: FC<RouteMapProps> = ({ calculateDistance }) => {
  return (
    <div>
      <button
        onClick={calculateDistance}
        className="bg-sky-500 hover:bg-sky-400 transition-colors cursor-pointer px-4 py-2 rounded-lg text-white w-full"
      >
        Calculate Distance
      </button>
    </div>
  );
};

export default RouteMap;
