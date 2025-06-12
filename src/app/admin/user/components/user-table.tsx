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
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import EditUserDialog from "./edit-user-dialog";

interface UserType {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
}

const UserTable = () => {
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
    data: UserType[];
    pagination: { total: number; skip: number; limit: number; hasMore: boolean };
  }>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get("/api/users", {
        params: {
          skip: 1, 
          limit: 1,
        },
      });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Pengguna berhasil dihapus");
      setOpenDropdown(null);
    },
    onError: (error: import("axios").AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Gagal menghapus pengguna");
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
    toast.error("Gagal memuat data pengguna.");
    return null;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12">#</TableHead>
            <TableHead className="w-3/12">Nama lengkap</TableHead>
            <TableHead className="w-3/12">Role</TableHead>
            <TableHead className="w-full">Email</TableHead>
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
              <TableCell>
                <Skeleton className="h-[37px] w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-[37px] w-full" />
              </TableCell>
            </TableRow>
          ) : data?.data?.length !== 0 ? (
            data?.data.map((row, index) => (
              <React.Fragment key={row.id}>
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
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>{row.email}</TableCell>
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

                <EditUserDialog
                  open={openUpdateDialog === row.id}
                  setOpen={setOpenUpdateDialog}
                  userId={row.id}
                />
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="py-3 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default UserTable;