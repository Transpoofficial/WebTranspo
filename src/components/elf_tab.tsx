"use client";

import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import DestinationTab from "./destination_tab";
import DepartureReturnDateTab from "./departure_return_date_tab";
import { Separator } from "@/components/ui/separator";

const ElfTab = () => {
  const [showDestination, setShowDestination] = useState<boolean>(false);
  const [showDepartureAndReturnDate, setShowDepartureAndReturnDate] =
    useState<boolean>(false);
  const [showFleetNeeds, setShowFleetNeeds] = useState<boolean>(false);

  const [numberOfVehicles, setNumberOfVehicles] = useState<number>(1);

  const increaseNumberOfVehicles = (): void => {
    setNumberOfVehicles((prev) => prev + 1);
  };

  const reduceNumberOfVehicles = (): void => {
    if (numberOfVehicles > 1) {
      setNumberOfVehicles((prev) => prev - 1);
    }
  };

  const showDestinationFunc = (): void => {
    if (showDepartureAndReturnDate === true || showFleetNeeds === true) {
      setShowDepartureAndReturnDate(false);
      setShowFleetNeeds(false);
    }

    setShowDestination(true);
  };

  const showDepartureAndReturnDateFunc = (): void => {
    if (showDestination === true || showFleetNeeds === true) {
      setShowDestination(false);
      setShowFleetNeeds(false);
    }

    setShowDepartureAndReturnDate(true);
  };

  const showFleetNeedsFunc = (): void => {
    if (showDestination === true || showDepartureAndReturnDate === true) {
      setShowDestination(false);
      setShowDepartureAndReturnDate(false);
    }

    setShowFleetNeeds(true);
  };

  return (
    <>
      {(showDestination || showDepartureAndReturnDate || showFleetNeeds) && (
        <div
          className="fixed inset-0 bg-black/[.5] z-10"
          onClick={() => {
            setShowDestination(false); // Close on backdrop click
            setShowDepartureAndReturnDate(false); // Close on backdrop click
            setShowFleetNeeds(false); // Close on backdrop click
          }}
        />
      )}
      {/* Backdrop */}

      {/* Main Content */}
      <div
        className={`relative mx-1 grid grid-cols-12 divide-x rounded-full z-50 ${
          showDestination || showDepartureAndReturnDate || showFleetNeeds
            ? "bg-gray-300"
            : ""
        }`}
      >
        {/* Destination */}
        <div className="col-span-4">
          {/* Destination Button */}
          <button
            onClick={showDestinationFunc}
            className={`cursor-pointer w-full py-3.5 px-7 rounded-full transition duration-200 ${
              showDestination ? "bg-white shadow-lg" : "hover:bg-gray-100"
            } active:scale-95`}
          >
            <p className="text-left text-sm font-semibold">Tujuan</p>

            <div className="mt-1 flex items-center divide-x">
              <p className="text-left w-full text-sm text-[#6A6A6A]">
                Titik jemput
              </p>
              <p className="w-full text-sm text-[#6A6A6A]">Lokasi tujuan</p>
            </div>
          </button>

          {/* Destination Tab */}
          {showDestination && <DestinationTab />}
        </div>

        {/* Departure and Return */}
        <div className="relative col-span-4">
          {/* Departure and Return Date Button */}
          <button
            onClick={showDepartureAndReturnDateFunc}
            className={`flex justify-between items-center cursor-pointer h-full w-full py-3.5 px-7 rounded-full transition duration-200 ${
              showDepartureAndReturnDate
                ? "bg-white shadow-lg"
                : "hover:bg-gray-100"
            } active:scale-95`}
          >
            <div className="flex flex-col gap-y-1">
              <p className="text-left text-sm font-semibold">
                Tanggal berangkat
              </p>
              <p className="text-left text-sm text-[#6A6A6A]">
                Tambahkan tanggal
              </p>
            </div>

            <Separator orientation="vertical" />

            <div className="flex flex-col gap-y-1">
              <p className="text-left text-sm font-semibold">Tanggal pulang</p>
              <p className="text-left text-sm text-[#6A6A6A]">
                Tambahkan tanggal
              </p>
            </div>
          </button>

          {/* Departure and Return Date Tab */}
          {showDepartureAndReturnDate && <DepartureReturnDateTab />}
        </div>

        {/* Fleet Needs */}
        <div className="col-span-4">
          <div
            onClick={showFleetNeedsFunc}
            className={`cursor-pointer w-full py-3.5 pb-1.5 px-7 rounded-full transition duration-200 ${
              showFleetNeeds ? "bg-white shadow-lg" : "hover:bg-gray-100"
            } active:scale-95`}
          >
            <p className="text-sm font-semibold">Kebutuhan armada</p>

            <div className="flex items-center mt-1">
              <button
                onClick={reduceNumberOfVehicles}
                className={`p-1.5 border transition duration-200 rounded-full ${
                  numberOfVehicles === 1 || showFleetNeeds === false
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:border-black"
                }`}
              >
                <Minus size={14} />
              </button>
              <span className="px-3 font-medium">{numberOfVehicles}</span>
              <button
                onClick={increaseNumberOfVehicles}
                className={`p-1.5 border transition duration-200 rounded-full ${
                  showFleetNeeds === false
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:border-black"
                }`}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ElfTab;
