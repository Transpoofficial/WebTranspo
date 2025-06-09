"use client";
import React, { useState } from "react";
import VehicleTypeTable from "./components/vehicle-type-table";
import { Button } from "@/components/ui/button";
import VehicleTypeCreateDialog from "./components/vehicle-type-create-dialog";

const Vehicle = () => {
  const [isVehicleTypeCreateDialogOpen, setIsVehicleTypeCreateDialogOpen] =
    useState<boolean>(false);

  const handleOpenVehicleTypeCreateDialog = (): void => {
    setIsVehicleTypeCreateDialogOpen(true);
  };

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">
        Kendaraan
      </h1>

      <div className="my-4">
        <Button
          onClick={handleOpenVehicleTypeCreateDialog}
          className="cursor-pointer"
        >
          Tambah kendaraan
        </Button>
      </div>

      {/* Vehicle type dialog */}
      <VehicleTypeCreateDialog
        isVehicleTypeCreateDialogOpen={isVehicleTypeCreateDialogOpen}
        setIsVehicleTypeCreateDialogOpen={setIsVehicleTypeCreateDialogOpen}
      />

      <VehicleTypeTable />
    </>
  );
};

export default Vehicle;
