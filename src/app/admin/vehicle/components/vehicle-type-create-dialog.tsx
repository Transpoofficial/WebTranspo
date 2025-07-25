"use client";
import React, { useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface VehicleTypeCreateDialogProps {
  isVehicleTypeCreateDialogOpen: boolean;
  setIsVehicleTypeCreateDialogOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

const vehicleTypeSchema = z.object({
  name: z.string().min(1, { message: "Tipe kendaraan wajib diisi" }),
  capacity: z.string().min(1, { message: "Kapasitas wajib diisi" }),
  pricePerKm: z
    .string()
    .min(1, { message: "Harga per kilometer(km) wajib diisi" }),
});

type VehicleTypeInput = z.infer<typeof vehicleTypeSchema>;

const VehicleTypeCreateDialog: React.FC<VehicleTypeCreateDialogProps> = ({
  isVehicleTypeCreateDialogOpen,
  setIsVehicleTypeCreateDialogOpen,
}) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<VehicleTypeInput>({
    resolver: zodResolver(vehicleTypeSchema),
    defaultValues: {
      name: "",
      capacity: "",
      pricePerKm: "",
    },
  });
  const vehicleTypeMutation = useMutation({
    mutationFn: async (data: VehicleTypeInput) => {
      const response = await axios.post("/api/vehicle-types", {
        name: data.name,
        capacity: parseInt(data.capacity),
        pricePerKm: parseFloat(data.pricePerKm),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tipe kendaraan berhasil ditambahkan.");

      queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
      setIsVehicleTypeCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: import("axios").AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          "Uh oh! Terjadi kesalahan, silakan coba lagi."
      );
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onSubmit = (data: VehicleTypeInput) => {
    setLoading(true);
    vehicleTypeMutation.mutate(data);
  };

  return (
    <Dialog
      open={isVehicleTypeCreateDialogOpen}
      onOpenChange={setIsVehicleTypeCreateDialogOpen}
    >
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Tambah tipe kendaraan</DialogTitle>
              <DialogDescription>
                Tambah tipe kendaraan di sini. Klik simpan setelah selesai.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-y-4 py-4">
              {" "}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe kendaraan</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    {form.formState.errors.name && <FormMessage />}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapasitas</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="" {...field} />
                    </FormControl>
                    {form.formState.errors.capacity && <FormMessage />}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga per kilometer(km)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="" {...field} />
                    </FormControl>
                    {form.formState.errors.pricePerKm && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                disabled={loading}
                className="cursor-pointer"
                type="submit"
              >
                {loading ? (
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

export default VehicleTypeCreateDialog;
