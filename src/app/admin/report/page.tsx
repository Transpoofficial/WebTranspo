"use client";
import React from "react";
// import VehicleTypeTable from "./components/vehicle-type-table";
import { Button } from "@/components/ui/button";
// import VehicleTypeCreateDialog from "./components/vehicle-type-create-dialog";

const Report = () => {
  // const [isVehicleTypeCreateDialogOpen, setIsVehicleTypeCreateDialogOpen] =
  //   useState<boolean>(false);

  // const handleOpenVehicleTypeCreateDialog = (): void => {
  //   setIsVehicleTypeCreateDialogOpen(true);
  // };

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight first:mt-0">
        Paket wisata
      </h2>

      <div className="flex justify-end mt-4 mb-1">
        <Button
          // onClick={handleOpenVehicleTypeCreateDialog}
          className="cursor-pointer"
        >
          Tambah paket wisata
        </Button>
      </div>

      {/* Vehicle type dialog */}
      {/* <VehicleTypeCreateDialog
        isVehicleTypeCreateDialogOpen={isVehicleTypeCreateDialogOpen}
        setIsVehicleTypeCreateDialogOpen={setIsVehicleTypeCreateDialogOpen}
      />

      <VehicleTypeTable /> */}
    </>
  );
};

export default Report;
