"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onEdit?: (data: TData) => void
  onDelete?: (data: TData) => void
  onCopy?: (data: TData) => void
  onFavorite?: (data: TData) => void
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
  onCopy,
  onFavorite,
}: DataTableRowActionsProps<TData>) {
  const handleEdit = () => {
    if (onEdit) onEdit(row.original)
  }

  const handleDelete = () => {
    if (onDelete) onDelete(row.original)
  }

  const handleCopy = () => {
    if (onCopy) onCopy(row.original)
  }

  const handleFavorite = () => {
    if (onFavorite) onFavorite(row.original)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleEdit}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          Make a copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFavorite}>
          Favorite
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}