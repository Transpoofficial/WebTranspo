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

interface VehicleType {
  id: string;
  name: string;
}

interface VehicleTypeUpdateDialogProps {
  openUpdateDialog: boolean;
  setOpenUpdateDialog: React.Dispatch<React.SetStateAction<string | null>>;
  vehicleType: VehicleType;
}

const vehicleTypeSchema = z.object({
  name: z.string().min(1, { message: "Tipe kendaraan wajib diisi" }),
});

type VehicleTypeInput = z.infer<typeof vehicleTypeSchema>;

const VehicleTypeUpdateDialog: React.FC<VehicleTypeUpdateDialogProps> = ({
  openUpdateDialog,
  setOpenUpdateDialog,
  vehicleType,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<VehicleTypeInput>({
    resolver: zodResolver(vehicleTypeSchema),
    defaultValues: {
      name: vehicleType.name || "",
    },
  });

  useEffect(() => {
    form.reset({ name: vehicleType.name });
  }, [vehicleType, form]);

  const vehicleTypeMutation = useMutation({
    mutationFn: async (data: VehicleTypeInput) => {
      const response = await axios.put(`/api/vehicle-types/${vehicleType.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tipe kendaraan berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
      setOpenUpdateDialog(null);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Uh oh! Terjadi kesalahan, silakan coba lagi.");
    },
  });

  const onSubmit = (data: VehicleTypeInput) => {
    vehicleTypeMutation.mutate(data);
  };

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

            <div className="flex flex-col gap-y-2 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe kendaraan</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan tipe kendaraan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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