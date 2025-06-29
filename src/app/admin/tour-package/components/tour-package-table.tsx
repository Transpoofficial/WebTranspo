"use client";

import React, { useState } from "react";
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
import TourPackageUpdateDialog from "./tour-package-update-dialog";

interface TourPackage {
  id: string;
  photoUrl: Array<{ url: string }>;
  name: string;
  price: string;
  description: string;
  meetingPoint: string;
  minPersonCapacity: number;
  maxPersonCapacity: number;
  includes: Array<{ text: string }>;
  excludes: Array<{ text: string }>;
  itineraries: Array<{ text?: string; opsional?: string }>;
  requirements: Array<{ text: string }>;

  tickets: Array<{ date: string }> | null;
  is_private: boolean;
  createdAt: string;
  updatedAt: string;
}

const TourPackageTable = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleDropdownToggle = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const { data, isLoading, error } = useQuery<{
    data: TourPackage[];
  }>({
    queryKey: ["tour-packages"],
    queryFn: async () => {
      const response = await axios.get("/api/tour-packages");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/tour-packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour-packages"] });
      toast.success("Paket wisata berhasil dihapus");
      setOpenDropdown(null);
    },
    onError: (error: import("axios").AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Gagal menghapus paket wisata"
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

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  if (error) {
    toast.error("Gagal memuat data paket wisata.");
    return null;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12">#</TableHead>
            <TableHead>Nama Paket</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Meeting Point</TableHead>
            <TableHead>Min/Max Person</TableHead>
            <TableHead>Include</TableHead>
            <TableHead>Exclude</TableHead>
            <TableHead>Tipe Trip</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
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
                <TableCell>
                  <Skeleton className="h-[37px] w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[37px] w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[37px] w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[37px] w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[37px] w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : data?.data?.length !== 0 ? (
            data?.data?.map((row, index) => {
              return (
                <React.Fragment key={index}>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        className="transition duration-200 active:scale-99 cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{formatPrice(row.price)}</TableCell>
                        <TableCell>{row.meetingPoint}</TableCell>
                        <TableCell>
                          {row.minPersonCapacity} / {row.maxPersonCapacity}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {row.includes?.slice(0, 2).map((inc, idx) => (
                              <div key={idx} className="text-sm">
                                • {inc.text}
                              </div>
                            ))}
                            {row.includes && row.includes.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{row.includes.length - 2} lainnya
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {row.excludes?.slice(0, 2).map((exc, idx) => (
                              <div key={idx} className="text-sm">
                                • {exc.text}
                              </div>
                            ))}
                            {row.excludes && row.excludes.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{row.excludes.length - 2} lainnya
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.is_private ? "Private Trip" : "Open Trip"}
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

                  <TourPackageUpdateDialog
                    openUpdateDialog={openUpdateDialog}
                    setOpenUpdateDialog={setOpenUpdateDialog}
                    tourPackageId={openUpdateDialog}
                  />
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-3 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default TourPackageTable;