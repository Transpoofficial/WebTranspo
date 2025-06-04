"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import VehicleTypeCreateDialog from "./vehicle-type-create-dialog";
import VehicleDialog from "./vehicle-dialog";

const AddVehicleMenu = () => {
  const [isVehicleTypeCreateDialogOpen, setIsVehicleTypeCreateDialogOpen] =
    useState<boolean>(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] =
    useState<boolean>(false);

  const handleOpenVehicleTypeCreateDialog = (): void => {
    setIsVehicleTypeCreateDialogOpen(true);
  };

  const handleOpenVehicleDialog = (): void => {
    setIsVehicleDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer">Tambah kendaraan</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleOpenVehicleTypeCreateDialog}
          >
            Tipe kendaraan
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleOpenVehicleDialog}>
            Kendaraan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vehicle type dialog */}
      <VehicleTypeCreateDialog
        isVehicleTypeCreateDialogOpen={isVehicleTypeCreateDialogOpen}
        setIsVehicleTypeCreateDialogOpen={setIsVehicleTypeCreateDialogOpen}
      />

      {/* Vehicle dialog */}
      <VehicleDialog
        isVehicleDialogOpen={isVehicleDialogOpen}
        setIsVehicleDialogOpen={setIsVehicleDialogOpen}
      />
    </>
  );
};

export default AddVehicleMenu;
