"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface UserType {
  id: string;
  fullName: string;
  email: string;
}

interface EditUserDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<string | null>>;
  userId: string;
}

const userSchema = z.object({
  fullName: z.string().min(1, { message: "Nama lengkap wajib diisi" }),
  email: z.string().email({ message: "Alamat email tidak valid" }),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      { message: "Kata sandi harus terdiri dari setidaknya 6 karakter jika diisi" }
    ),
});

type UserInput = z.infer<typeof userSchema>;

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  setOpen,
  userId,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  // Fetch user data based on ID
  const { data: user, isLoading, error } = useQuery<UserType>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data.data; // Adjust based on your API response structure
    },
    enabled: open && !!userId,
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        email: user.email,
        password: "", // Do not pre-fill password
      });
    }
  }, [user, form]);

  const userMutation = useMutation({
    mutationFn: async (data: UserInput) => {
      // Only include password in the payload if it's provided
      const payload = {
        fullName: data.fullName,
        email: data.email,
        ...(data.password && { password: data.password }),
      };
      const response = await axios.put(`/api/users/${userId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Pengguna berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(null);
      form.reset();
    },
    onError: (error: import("axios").AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message ||
          "Uh oh! Terjadi kesalahan, silakan coba lagi."
      );
    },
  });

  const onSubmit = (data: UserInput) => {
    userMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit pengguna</DialogTitle>
            <DialogDescription>
              Edit pengguna di sini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2 py-4">
            <div>Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    toast.error("Gagal memuat data pengguna.");
    setOpen(null);
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4 py-4">
            <DialogHeader>
              <DialogTitle>Edit pengguna</DialogTitle>
              <DialogDescription>
                Edit pengguna di sini. Klik simpan setelah selesai.
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata sandi (opsional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Masukkan kata sandi baru (kosongkan jika tidak ingin mengubah)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(null)}>
                Batal
              </Button>
              <Button
                disabled={userMutation.isPending}
                className="cursor-pointer"
                type="submit"
              >
                {userMutation.isPending ? (
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

export default EditUserDialog;