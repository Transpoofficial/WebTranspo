"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { orderTypes } from "../data/data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchValue: string
  orderTypeFilter: string[]
  orderStatusFilter: string[]
  vehicleTypeFilter: string[]
  paymentStatusFilter: string[]
  onSearch: (value: string) => void
  onOrderTypeFilter: (values: string[]) => void
  onOrderStatusFilter: (values: string[]) => void
  onVehicleTypeFilter: (values: string[]) => void
  onPaymentStatusFilter: (values: string[]) => void
  vehicleTypes: { value: string; label: string }[]
}

export function DataTableToolbar<TData>({
  table,
  searchValue = "",
  orderTypeFilter = [],
  orderStatusFilter = [],
  vehicleTypeFilter = [],
  paymentStatusFilter = [],
  onSearch,
  onOrderTypeFilter,
  onOrderStatusFilter,
  onVehicleTypeFilter,
  onPaymentStatusFilter,
  vehicleTypes,
}: DataTableToolbarProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()

  // Replace length checks with safe checks
  const hasFilters =
    orderTypeFilter?.length > 0 ||
    orderStatusFilter?.length > 0 ||
    vehicleTypeFilter?.length > 0 ||
    paymentStatusFilter?.length > 0 ||
    !!searchValue

  // Reset all filters and clear URL params
  const handleResetFilters = () => {
    // Reset local state
    onSearch("")
    onOrderTypeFilter([])
    onOrderStatusFilter([])
    onVehicleTypeFilter([])
    onPaymentStatusFilter([])
    table.resetColumnFilters()

    // Clear URL params by pushing to base path
    router.push(pathname)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2 overflow-x-auto">
        <Input
          placeholder="Cari nama, email, atau nomor telepon..."
          value={searchValue}
          onChange={(event) => onSearch(event.target.value)}
          className="h-8 min-w-[150px] w-[150px] lg:min-w-[250px] lg:w-[250px]"
        />
        {table.getColumn("orderType") && (
          <DataTableFacetedFilter
            column={table.getColumn("orderType")}
            title="Tipe"
            options={orderTypes}
            selectedValues={orderTypeFilter}
            onValuesChange={onOrderTypeFilter}
          />
        )}
        {table.getColumn("orderStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("orderStatus")}
            title="Status pesanan"
            options={[
              { label: "Menunggu", value: "PENDING" },
              { label: "Dikonfirmasi", value: "CONFIRMED" },
              { label: "Dibatalkan", value: "CANCELED" },
              { label: "Selesai", value: "COMPLETED" },
              { label: "Dikembalikan", value: "REFUNDED" },
            ]}
            selectedValues={orderStatusFilter}
            onValuesChange={onOrderStatusFilter}
          />
        )}
        {table.getColumn("vehicleType") && (
          <DataTableFacetedFilter
            column={table.getColumn("vehicleType")}
            title="Kendaraan"
            options={vehicleTypes}
            selectedValues={vehicleTypeFilter}
            onValuesChange={onVehicleTypeFilter}
          />
        )}
        {table.getColumn("paymentStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("paymentStatus")}
            title="Status pembayaran"
            options={[
              { label: "Menunggu", value: "PENDING" },
              { label: "Disetujui", value: "APPROVED" },
              { label: "Ditolak", value: "REJECTED" },
            ]}
            selectedValues={paymentStatusFilter}
            onValuesChange={onPaymentStatusFilter}
          />
        )}
      </div>
      {hasFilters && (
        <Button
          variant="ghost"
          onClick={handleResetFilters}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
