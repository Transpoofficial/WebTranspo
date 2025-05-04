import React from "react";
import VehicleTable from "./components/vehicle-table";
import VehicleTypeTable from "./components/vehicle-type-table";
import { Separator } from "@/components/ui/separator";
import AddVehicleMenu from "./components/add-vehicle-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Vehicle = () => {
  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Kendaraan
      </h1>

      <div className="flex justify-end mt-6">
        <AddVehicleMenu />
      </div>

      {/* Desktop and Tablet View */}
      <div className="hidden md:block mt-4">
        <div className="flex items-start">
          <div className="w-1/3">
            <VehicleTypeTable />
          </div>

          <Separator orientation="vertical" className="mx-4" />

          <div className="w-full">
            <VehicleTable />
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <Tabs defaultValue="vehicleType" className="block md:hidden mt-4">
        <TabsList className="mb-2.5">
          <TabsTrigger value="vehicleType">Tipe kendaraan</TabsTrigger>
          <TabsTrigger value="vehicle">Kendaraan</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicleType">
          <VehicleTypeTable />
        </TabsContent>
        <TabsContent value="vehicle">
          <VehicleTable />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Vehicle;
