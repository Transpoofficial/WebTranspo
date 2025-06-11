"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orderTypes } from "../data/data";
import { BackendDataTableFacetedFilter } from "./backend-data-table-faceted-filter";

interface Filters {
  search?: string;
  orderType: string;
  orderStatus: string;
  vehicleType: string;
  paymentStatus: string;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters?: Filters;
  searchInput?: string;
  onSearchChange?: (search: string) => void;
  onFiltersChange?: (filters: Partial<Filters>) => void;
  isLoading?: boolean;
}

export function DataTableToolbar<TData>({
  filters,
  searchInput,
  onSearchChange,
  onFiltersChange,
  isLoading = false,
}: DataTableToolbarProps<TData>) {
  // Update query to handle the response structure correctly
  const { data: vehicleTypesResponse, isLoading: isVehicleTypesLoading } = useQuery({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const response = await axios.get("/api/vehicle-types");
      return response.data;
    },
  });

  interface VehicleType {
    name: string;
    id: string;
  }

  // Format vehicle types for filter options
  const vehicleTypes = React.useMemo(() => {
    if (!vehicleTypesResponse?.data) return [];
    return vehicleTypesResponse.data.map((type: VehicleType) => ({
      label: type.name,
      value: type.name,
    }));
  }, [vehicleTypesResponse]);

  const isFiltered =
    searchInput || // Check searchInput untuk filtered state
    filters?.orderType ||
    filters?.orderStatus ||
    filters?.vehicleType ||
    filters?.paymentStatus;

  const handleSearchChange = React.useCallback(
    (value: string) => {
      onSearchChange?.(value); // Langsung panggil tanpa delay
    },
    [onSearchChange]
  );

  const handleFilterChange = React.useCallback(
    (key: string, value: string) => {
      onFiltersChange?.({ [key]: value });
    },
    [onFiltersChange]
  );

  const handleReset = React.useCallback(() => {
    onSearchChange?.(""); // Reset search
    // Reset all filters to empty string to trigger removal from URL
    onFiltersChange?.({
      search: "",
      orderType: "",
      orderStatus: "",
      vehicleType: "",
      paymentStatus: "",
    });
  }, [onSearchChange, onFiltersChange]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2 overflow-x-auto">
        {" "}
        <Input
          placeholder="Cari nama, email, atau nomor telepon..."
          value={searchInput || ""} // Gunakan searchInput langsung
          onChange={(event) => handleSearchChange(event.target.value)} // Panggil callback langsung
          className="h-8 min-w-[150px] w-[150px] lg:min-w-[250px] lg:w-[250px]"
          disabled={isLoading}
          autoComplete="off" // Disable autocomplete untuk performa
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
          disabled={isLoading || isVehicleTypesLoading}
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
