"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const userSchema = z.object({
  fullname: z.string().min(1, { message: "Nama lengkap wajib diisi" }),
  email: z.string().email({ message: "Alamat email tidak valid" }),
  password: z
    .string()
    .min(6, { message: "Kata sandi harus terdiri dari setidaknya 6 karakter" }),
});

type UserInput = z.infer<typeof userSchema>;

const AddUserDialog = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema),
  });

  const userMutation = useMutation({
    mutationFn: async (data: UserInput) => {
      const response = await axios.post("/api/users", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Pengguna berhasil ditambahkan.");

      queryClient.invalidateQueries({ queryKey: ["users"] });
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

  const onSubmit = (data: UserInput) => {
    setLoading(true);
    userMutation.mutate(data);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="cursor-pointer">Tambah pengguna</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah pengguna</DialogTitle>
            <DialogDescription>
              Tambah pengguna di sini. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-y-4 py-4"
            >
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    {form.formState.errors.fullname && <FormMessage />}
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    {form.formState.errors.email && <FormMessage />}
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    {form.formState.errors.password && <FormMessage />}
                  </FormItem>
                )}
              />

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
    </>
  );
};

export default AddUserDialog;
