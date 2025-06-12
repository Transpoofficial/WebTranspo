"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { DataTablePagination } from "./data-table-pagination"
import { User } from "../data/schema"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserOperations } from "./user-operations"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: {
    pageIndex: number
    pageSize: number
    pageCount: number
    onPageChange: (pageIndex: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
}

export function DataTable<TData extends User, TValue>({
  columns,
  data,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null)
  const [isActionDrawerOpen, setIsActionDrawerOpen] = React.useState(false)
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = React.useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false)
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await axios.delete(`/api/users/${userId}`)
      return data
    },
    onSuccess: () => {
      toast.success("User berhasil dihapus")
      setIsDeleteDrawerOpen(false)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      console.error(error)
      toast.error("Gagal menghapus user")
    },
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination:
        pagination && {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: pagination?.pageCount ?? -1,
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (!pagination) return

      const currentState = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }
      const newState =
        typeof updater === "function" ? updater(currentState) : updater

      if (newState.pageIndex !== currentState.pageIndex) {
        pagination.onPageChange(newState.pageIndex)
      }
      if (newState.pageSize !== currentState.pageSize) {
        pagination.onPageSizeChange(newState.pageSize)
      }
    },
  })

  const handleLongPressStart = (row: TData) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedRow(row)
      setIsActionDrawerOpen(true)
    }, 800)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleUpdateUser = (row: TData) => {
    setSelectedRow(row)
    setIsActionDrawerOpen(false)
    setIsUpdateDialogOpen(true)
  }

  const handleDelete = () => {
    if (selectedRow) {
      deleteMutation.mutate(selectedRow.id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      onMouseDown={() => handleLongPressStart(row.original)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      onTouchStart={() => handleLongPressStart(row.original)}
                      onTouchEnd={handleLongPressEnd}
                      className="relative cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleUpdateUser(row.original)}>
                      Update user
                    </ContextMenuItem>
                    <ContextMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        setSelectedRow(row.original)
                        setIsDeleteDrawerOpen(true)
                      }}
                    >
                      Hapus user
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada user ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && <DataTablePagination table={table} pagination={pagination} />}

      {/* Action Drawer for Mobile */}
      <Drawer open={isActionDrawerOpen} onOpenChange={setIsActionDrawerOpen}>
        <DrawerContent>
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => selectedRow && handleUpdateUser(selectedRow)}
            >
              Update User
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600"
              onClick={() => {
                setIsDeleteDrawerOpen(true)
                setIsActionDrawerOpen(false)
              }}
            >
              Hapus User
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full justify-start">
                Batal
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Drawer */}
      <Drawer open={isDeleteDrawerOpen} onOpenChange={setIsDeleteDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Hapus User</DrawerTitle>
            <DrawerDescription>
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus User"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Batal</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Update User Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
          </DialogHeader>
          {selectedRow && (
            <UserOperations 
              user={selectedRow} 
              onComplete={() => setIsUpdateDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
