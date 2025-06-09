"use client";

import React, { useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import VehicleTypeUpdateDialog from "./vehicle-type-update-dialog";

interface VehicleType {
  id: string;
  name: string;
  pricePerKm: number;
}

const VehicleTypeTable = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const handleLongPressStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      setOpenDropdown(id);
    }, 800);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDropdownToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const { data, isLoading, error } = useQuery<{
    data: VehicleType[];
  }>({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const response = await axios.get("/api/vehicle-types");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/vehicle-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
      toast.success("Tipe kendaraan berhasil dihapus");
      setOpenDropdown(null);
    },
    onError: (error: import("axios").AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Gagal menghapus tipe kendaraan"
      );
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (id: string) => {
    setOpenDropdown(null);
    setOpenUpdateDialog(id);
  };

  if (error) {
    toast.error("Gagal memuat data tipe kendaraan.");
    return null;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12">#</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Harga per kilometer(km)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <Skeleton className="h-[37px] w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-[37px] w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-[37px] w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : data?.data?.length !== 0 ? (
            data?.data?.map((row, index) => {
              return (
                <React.Fragment key={index}>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        onMouseDown={() => handleLongPressStart(row.id)}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onTouchStart={() => handleLongPressStart(row.id)}
                        onTouchEnd={handleLongPressEnd}
                        className="relative transition duration-200 active:scale-99 cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>
                          {row.pricePerKm
                            ? Number(row.pricePerKm).toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleEdit(row.id)}>
                        Edit
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600"
                      >
                        Hapus
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>

                  <Drawer
                    open={openDropdown === row.id}
                    onOpenChange={() => handleDropdownToggle(row.id)}
                  >
                    <DrawerContent>
                      <div className="flex flex-col gap-y-2 p-4">
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => handleEdit(row.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(row.id)}
                          variant="ghost"
                          className="justify-start text-red-600"
                        >
                          {deleteMutation.isPending ? (
                            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Hapus"
                          )}
                        </Button>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  <VehicleTypeUpdateDialog
                    openUpdateDialog={openUpdateDialog === row.id}
                    setOpenUpdateDialog={setOpenUpdateDialog}
                    vehicleTypeId={row.id}
                  />
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="py-3 text-center">
                Tidak ada hasil.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default VehicleTypeTable;
