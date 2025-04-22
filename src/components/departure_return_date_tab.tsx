"use client";

import React from "react";
import { Button } from "./ui/button";
import { DatetimePicker } from "./datetime-picker";

const DepartureReturnDateTab = () => {
  const [departureDate, setDepartureDate] = React.useState<Date | undefined>(new Date());
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(new Date());

  return (
    <>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-3xl w-full bg-white rounded-4xl shadow-lg p-7">
        <p className="text-sm mb-6">
        Tentukan tanggal pemberangkatan dan tanggal kepulangan Anda.
        </p>

        <div className="flex items-center gap-x-14">
          <div className="flex flex-col w-full gap-y-4">
            <h5 className="text-center text-lg font-semibold">
              Tanggal berangkat
            </h5>

            {/* Departure Calendar */}
            <DatetimePicker
              selected={departureDate}
              setDate={setDepartureDate}
              initialFocus
            />
          </div>

          <div className="flex flex-col w-full gap-y-4">
            <h5 className="text-center text-lg font-semibold">
              Tanggal pulang
            </h5>

            {/* Return Calendar */}
            <DatetimePicker
              selected={returnDate}
              setDate={setReturnDate}
              initialFocus
            />
          </div>
        </div>

        <Button className="cursor-pointer mt-8">Lanjut</Button>
      </div>
    </>
  );
};

export default DepartureReturnDateTab;
