"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Drawer, DrawerClose, DrawerContent } from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { DataTablePagination } from "./data-table-pagination";
// import { DataTableToolbar } from "./data-table-toolbar";
import { ArticleSchema } from "../data/schema";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  skip: number;
  limit: number;
  setSkip: (skip: number) => void;
  setLimit: (limit: number) => void;
}

export function DataTable<TData extends ArticleSchema, TValue>({
  columns,
  data,
  total,
  skip,
  limit,
  setSkip,
  setLimit,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination: {
        pageIndex: Math.floor(skip / limit),
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: Math.ceil(total / limit),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater(table.getState().pagination) : updater;
      setSkip(newState.pageIndex * newState.pageSize);
      setLimit(newState.pageSize);
    },
  });

  const handleLongPressStart = (row: TData) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedRow(row);
      setIsActionDrawerOpen(true);
    }, 800);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleEdit = (row: TData) => {
    router.push(`/admin/article/edit/${row.id}`);
    setIsActionDrawerOpen(false);
  };

  const handleDelete = (row: TData) => {
    setSelectedRow(row);
    setIsActionDrawerOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedRow) {
      try {
        await axios.delete(`/api/articles/${selectedRow.id}`);
        toast.success("Article deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedRow(null);
        // Invalidate articles cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: ["articles"] });
      } catch (error) {
        toast.error("Failed to delete article");
        console.error("Error deleting article:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* <DataTableToolbar table={table} /> */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleEdit(row.original)}>
                      Edit
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleDelete(row.original)}
                      className="text-red-600 focus:text-red-600"
                    >
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data yang tersedia.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      {/* Action Drawer for Mobile */}
      <Drawer open={isActionDrawerOpen} onOpenChange={setIsActionDrawerOpen}>
        <DrawerContent>
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => selectedRow && handleEdit(selectedRow)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => selectedRow && handleDelete(selectedRow)}
            >
              Delete
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full justify-start">
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}