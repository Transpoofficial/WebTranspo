"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = React.useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState("");
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleLongPressStart = (row: TData) => {
    longPressTimer.current = setTimeout(() => {
      // Open action drawer on mobile long press
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
    setSelectedRow(row);
    // Assuming the row has an 'id' or 'title' property
    const rowData = row as { id?: string; title?: string };
    setEditedTitle(rowData.id || rowData.title || "");
    setIsActionDrawerOpen(false); // Close action drawer
    setIsEditDrawerOpen(true);
  };

  const handleDelete = (row: TData) => {
    setSelectedRow(row);
    setIsActionDrawerOpen(false); // Close action drawer
    setIsDeleteDrawerOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedRow) {
      // Implement save logic here (e.g., API call to update task)
      console.log("Saving edited task:", {
        ...selectedRow,
        title: editedTitle,
      });
      setIsEditDrawerOpen(false);
      setSelectedRow(null);
      setEditedTitle("");
    }
  };

  const handleConfirmDelete = () => {
    if (selectedRow) {
      // Implement delete logic here (e.g., API call to delete task)
      console.log("Deleting task:", selectedRow);
      setIsDeleteDrawerOpen(false);
      setSelectedRow(null);
    }
  };

  const handleCopy = (row: TData) => {
    console.log("Copying task:", row);
    setIsActionDrawerOpen(false); // Close action drawer
  };

  const handleFavorite = (row: TData) => {
    console.log("Favoriting task:", row);
    setIsActionDrawerOpen(false); // Close action drawer
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
                      className="relative transition duration-200 active:scale-99 cursor-pointer"
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
                    <ContextMenuItem onClick={() => handleEdit(row.original)}>
                      Edit
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleCopy(row.original)}>
                      Make a copy
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleFavorite(row.original)}
                    >
                      Favorite
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
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
          <DrawerHeader>
            <DrawerTitle>Actions</DrawerTitle>
            <DrawerDescription>
              Choose an action for this item.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => selectedRow && handleEdit(selectedRow)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => selectedRow && handleCopy(selectedRow)}
            >
              Make a copy
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => selectedRow && handleFavorite(selectedRow)}
            >
              Favorite
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => selectedRow && handleDelete(selectedRow)}
            >
              Delete
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Order</DrawerTitle>
            <DrawerDescription>
              Update the order details below.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="mt-1"
                placeholder="Enter title"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Drawer */}
      <Drawer open={isDeleteDrawerOpen} onOpenChange={setIsDeleteDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Delete Order</DrawerTitle>
            <DrawerDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Order
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
