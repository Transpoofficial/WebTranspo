"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

interface VehicleType {
  message: string;
  data: {
    id: string;
    name: string;
    pricePerKm: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface VehicleTypeUpdateDialogProps {
  openUpdateDialog: boolean;
  setOpenUpdateDialog: React.Dispatch<React.SetStateAction<string | null>>;
  vehicleTypeId: string;
}

const vehicleTypeSchema = z.object({
  name: z.string().min(1, { message: "Tipe kendaraan wajib diisi" }),
  pricePerKm: z.string().min(1, { message: "Harga per kilometer(km) wajib diisi" }),
});

type VehicleTypeInput = z.infer<typeof vehicleTypeSchema>;

const VehicleTypeUpdateDialog: React.FC<VehicleTypeUpdateDialogProps> = ({
  openUpdateDialog,
  setOpenUpdateDialog,
  vehicleTypeId,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<VehicleTypeInput>({
    resolver: zodResolver(vehicleTypeSchema),
    defaultValues: {
      name: "",
      pricePerKm: "",
    },
  });

  // Fetch vehicle type data based on ID
  const {
    data: vehicleType,
    isLoading,
    error,
  } = useQuery<VehicleType>({
    queryKey: ["vehicle-type", vehicleTypeId],
    queryFn: async () => {
      const response = await axios.get(`/api/vehicle-types/${vehicleTypeId}`);
      return response.data;
    },
    enabled: openUpdateDialog && !!vehicleTypeId, // Only fetch when dialog is open and ID is provided
  });

  // Update form when vehicle type data is fetched
  useEffect(() => {
    if (vehicleType) {
      form.reset({ name: vehicleType?.data?.name, pricePerKm: vehicleType?.data?.pricePerKm.toString() });
    }
  }, [vehicleType, form]);

  const vehicleTypeMutation = useMutation({
    mutationFn: async (data: VehicleTypeInput) => {
      const response = await axios.put(
        `/api/vehicle-types/${vehicleTypeId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tipe kendaraan berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
      setOpenUpdateDialog(null);
      form.reset();
    },
    onError: (error: import("axios").AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          "Uh oh! Terjadi kesalahan, silakan coba lagi."
      );
    },
  });

  const onSubmit = (data: VehicleTypeInput) => {
    vehicleTypeMutation.mutate(data);
  };

  if (error) {
    toast.error("Gagal memuat data tipe kendaraan.");
    setOpenUpdateDialog(null);
    return null;
  }

  return (
    <Dialog
      open={openUpdateDialog}
      onOpenChange={() => setOpenUpdateDialog(null)}
    >
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit tipe kendaraan</DialogTitle>
              <DialogDescription>
                Edit tipe kendaraan di sini. Klik simpan setelah selesai.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-y-4 py-4">
              {isLoading ? (
                <Skeleton className="h-[58px] w-full" />
              ) : (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe kendaraan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan tipe kendaraan"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isLoading ? (
                <Skeleton className="h-[58px] w-full" />
              ) : (
                <FormField
                  control={form.control}
                  name="pricePerKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga per kilometer(km)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="" {...field} />
                      </FormControl>
                      {form.formState.errors.pricePerKm && (
                        <FormMessage />
                      )}
                    </FormItem>
                  )}
                />
              )}
              
            </div>

            <DialogFooter>
              <Button
                disabled={vehicleTypeMutation.isPending}
                className="cursor-pointer"
                type="submit"
              >
                {vehicleTypeMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleTypeUpdateDialog;
