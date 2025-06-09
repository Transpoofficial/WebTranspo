"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { orderTypes, vehicleTypes } from "../data/data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2 overflow-x-auto">
        <Input
          placeholder="Cari pesanan..."
          value={(table.getColumn("user")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("user")?.setFilterValue(event.target.value)
          }
          className="h-8 min-w-[150px] w-[150px] lg:min-w-[250px] lg:w-[250px]"
        />
        {table.getColumn("orderType") && (
          <DataTableFacetedFilter
            column={table.getColumn("orderType")}
            title="Tipe"
            options={orderTypes}
          />
        )}
        {table.getColumn("orderStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("orderStatus")}
            title="Status"
            options={[
              { label: "Menunggu", value: "PENDING" },
              { label: "Dikonfirmasi", value: "CONFIRMED" },
              { label: "Dibatalkan", value: "CANCELED" },
              { label: "Selesai", value: "COMPLETED" },
              { label: "Dikembalikan", value: "REFUNDED" },
            ]}
          />
        )}
        {table.getColumn("vehicleType") && (
          <DataTableFacetedFilter
            column={table.getColumn("vehicleType")}
            title="Kendaraan"
            options={vehicleTypes}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
