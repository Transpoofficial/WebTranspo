"use client";
import React, { useState } from "react";
import TourPackageTable from "./components/tour-package-table";
import { Button } from "@/components/ui/button";
import TourPackageCreateDialog from "./components/tour-package-create-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TourPackage = () => {
  const [isTourPackageCreateDialogOpen, setIsTourPackageCreateDialogOpen] =
    useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  const handleOpenTourPackageCreateDialog = (privateTrip: boolean): void => {
    setIsPrivate(privateTrip);
    setIsTourPackageCreateDialogOpen(true);
  };

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight first:mt-0">
        Paket Wisata
      </h2>

      <div className="flex justify-start mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="cursor-pointer">Tambah paket wisata</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => handleOpenTourPackageCreateDialog(false)}
            >
              Tambah Open Trip
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleOpenTourPackageCreateDialog(true)}
            >
              Tambah Private Trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tour package dialog */}
      <TourPackageCreateDialog
        isTourPackageCreateDialogOpen={isTourPackageCreateDialogOpen}
        setIsTourPackageCreateDialogOpen={setIsTourPackageCreateDialogOpen}
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
      />

      <TourPackageTable />
    </>
  );
};

export default TourPackage;