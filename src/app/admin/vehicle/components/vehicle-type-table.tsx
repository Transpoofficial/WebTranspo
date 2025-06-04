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
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Gagal menghapus tipe kendaraan"
      );
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tipe kendaraan ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    setOpenUpdateDialog(id);
  };

  if (error) {
    toast.error("Gagal memuat data tipe kendaraan.");
    return null;
  }

  return (
    <>
      <h4 className="hidden md:block scroll-m-20 text-xl font-semibold tracking-tight mb-2.5">
        Tipe kendaraan
      </h4>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/12">#</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell className="font-medium">
                <Skeleton className="h-[37px] w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-[37px] w-full" />
              </TableCell>
            </TableRow>
          ) : (
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
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    vehicleType={row}
                  />
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default VehicleTypeTable;