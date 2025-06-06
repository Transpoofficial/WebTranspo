"use client";
import React, { useState } from "react";
import TourPackageTable from "./components/tour-package-table";
import { Button } from "@/components/ui/button";
import TourPackageCreateDialog from "./components/tour-package-create-dialog";

const TourPackage = () => {
  const [isTourPackageCreateDialogOpen, setIsTourPackageCreateDialogOpen] =
    useState<boolean>(false);

  const handleOpenTourPackageCreateDialog = (): void => {
    setIsTourPackageCreateDialogOpen(true);
  };

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight first:mt-0">
        Paket Wisata
      </h2>

      <div className="flex justify-end mt-4 mb-1">
        <Button
          onClick={handleOpenTourPackageCreateDialog}
          className="cursor-pointer"
        >
          Tambah paket wisata
        </Button>
      </div>

      {/* Tour package dialog */}
      <TourPackageCreateDialog
        isTourPackageCreateDialogOpen={isTourPackageCreateDialogOpen}
        setIsTourPackageCreateDialogOpen={setIsTourPackageCreateDialogOpen}
      />

      <TourPackageTable />
    </>
  );
};

export default TourPackage;