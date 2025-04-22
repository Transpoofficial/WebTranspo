import React from "react";
import LocationInput from "./location_input";
import { Button } from "./ui/button";

const DestinationTab = () => {
  return (
    <>
      <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-4xl shadow-lg p-7">
        <p className="text-sm mb-6">
          Tentukan lokasi pemberangkatan dan tujuan Anda
        </p>

        {/* Input */}
        <div className="grid grid-cols-12">
          <div className="col-span-6">
            <LocationInput />
          </div>
          <div className="col-span-6">Google Maps</div>
        </div>

        <Button className="cursor-pointer mt-8">Lanjut</Button>
      </div>
    </>
  );
};

export default DestinationTab;
