"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { orderTypes, vehicleTypes } from "../data/data";
import { BackendDataTableFacetedFilter } from "./backend-data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters?: {
    search?: string;
    orderType: string;
    orderStatus: string;
    vehicleType: string;
    paymentStatus: string;
  };
  searchInput?: string;
  onSearchChange?: (search: string) => void;
  onFiltersChange?: (filters: any) => void;
  isLoading?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  filters,
  searchInput,
  onSearchChange,
  onFiltersChange,
  isLoading = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = filters
    ? Object.values(filters).some((value) => value !== "")
    : false;
  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    if (onFiltersChange) {
      onFiltersChange({ [key]: value });
    }
  };

  const handleReset = () => {
    if (onSearchChange) {
      onSearchChange("");
    }
    if (onFiltersChange) {
      onFiltersChange({
        orderType: "",
        orderStatus: "",
        vehicleType: "",
        paymentStatus: "",
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2 overflow-x-auto">
        {" "}
        <Input
          placeholder="Cari nama, email, atau nomor telepon..."
          value={searchInput ?? ""}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="h-8 min-w-[150px] w-[150px] lg:min-w-[250px] lg:w-[250px]"
          disabled={isLoading}
        />
        <BackendDataTableFacetedFilter
          title="Tipe"
          options={orderTypes}
          value={filters?.orderType ?? ""}
          onValueChange={(value) => handleFilterChange("orderType", value)}
          disabled={isLoading}
        />
        <BackendDataTableFacetedFilter
          title="Status pesanan"
          options={[
            { label: "Menunggu", value: "PENDING" },
            { label: "Dikonfirmasi", value: "CONFIRMED" },
            { label: "Dibatalkan", value: "CANCELED" },
            { label: "Selesai", value: "COMPLETED" },
            { label: "Dikembalikan", value: "REFUNDED" },
          ]}
          value={filters?.orderStatus ?? ""}
          onValueChange={(value) => handleFilterChange("orderStatus", value)}
          disabled={isLoading}
        />
        <BackendDataTableFacetedFilter
          title="Kendaraan"
          options={vehicleTypes}
          value={filters?.vehicleType ?? ""}
          onValueChange={(value) => handleFilterChange("vehicleType", value)}
          disabled={isLoading}
        />
        <BackendDataTableFacetedFilter
          title="Status pembayaran"
          options={[
            { label: "Menunggu", value: "PENDING" },
            { label: "Disetujui", value: "APPROVED" },
            { label: "Ditolak", value: "REJECTED" },
          ]}
          value={filters?.paymentStatus ?? ""}
          onValueChange={(value) => handleFilterChange("paymentStatus", value)}
          disabled={isLoading}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
            disabled={isLoading}
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
