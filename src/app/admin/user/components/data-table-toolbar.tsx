"use client"

import { Table } from "@tanstack/react-table"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchValue: string
  onSearch: (value: string) => void
}

export function DataTableToolbar<TData>({
  searchValue,
  onSearch,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <input
          placeholder="Cari nama..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px] rounded-md border px-3"
        />
      </div>
    </div>
  )
}
