"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import VehicleTypeDialog from "./vehicle-type-dialog";
import VehicleDialog from "./vehicle-dialog";

const AddVehicleMenu = () => {
  const [isVehicleTypeDialogOpen, setIsVehicleTypeDialogOpen] =
    useState<boolean>(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] =
    useState<boolean>(false);

  const handleOpenVehicleTypeDialog = (): void => {
    setIsVehicleTypeDialogOpen(true);
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
            onClick={handleOpenVehicleTypeDialog}
          >
            Tipe kendaraan
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleOpenVehicleDialog}>
            Kendaraan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vehicle type dialog */}
      <VehicleTypeDialog
        isVehicleTypeDialogOpen={isVehicleTypeDialogOpen}
        setIsVehicleTypeDialogOpen={setIsVehicleTypeDialogOpen}
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
