"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// API untuk update profil (dengan axios)
const updateProfile = async (
  id: string,
  data: { fullName: string; email: string; password?: string }
) => {
  try {
    const res = await axios.put(`/api/users/customers/${id}`, data);
    return res.data.data;
  } catch (err: Error | unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.error || "Gagal memperbarui profil");
    }
    throw new Error("Gagal memperbarui profil");
  }
};

// Validasi Zod
const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Nama lengkap harus memiliki setidaknya 2 karakter." })
    .max(30, { message: "Nama lengkap tidak boleh lebih dari 30 karakter." }),
  email: z
    .string({ required_error: "Harap masukkan alamat email." })
    .email({ message: "Harap masukkan alamat email yang valid." }),
  password: z
    .string()
    .optional()
    .or(z.literal("")) // izinkan password kosong
    .refine((val) => !val || val === "" || val.length >= 8, {
      message: "Kata sandi harus memiliki setidaknya 8 karakter.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { data: session, update: updateSession, status } = useSession();

  // Cek apakah sesi sedang loading
  const isPending = status === "loading";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        fullName: session.user.fullName || "",
        email: session.user.email || "",
        password: "",
      });
    }
  }, [session, form]);

  const mutation = useMutation({
    mutationFn: (formData: ProfileFormValues) => {
      if (!session?.user?.id)
        throw new Error("User ID tidak ditemukan di session");
      return updateProfile(session.user.id, formData);
    },
    onSuccess: (updatedUser) => {
      toast.success("Profil berhasil diperbarui.");

      // Perbarui sesi dengan data baru
      updateSession({
        ...session,
        user: {
          ...session?.user,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Terjadi kesalahan saat update profil.");
    },
  });

  function onSubmit(data: ProfileFormValues) {
    const { fullName, email, password } = data;

    const payload = {
      fullName,
      email,
      ...(password ? { password } : {}), // hanya sertakan jika diisi
    };

    mutation.mutate(payload as ProfileFormValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {isPending ? (
          <Skeleton className="w-full h-[86px]" />
        ) : (
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Nama lengkap" {...field} />
                </FormControl>
                <FormDescription>
                  Gunakan nama asli atau nama panggilan. Panjang 2–30 karakter.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isPending ? (
          <Skeleton className="w-full h-[86px]" />
        ) : (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Alamat email" {...field} disabled />
                </FormControl>
                <FormDescription>
                  Masukkan alamat email yang valid.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Baru</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Kata sandi baru"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Masukkan kata sandi baru (8–100 karakter).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={mutation.isPending}
          type="submit"
          className="cursor-pointer"
        >
          {mutation.isPending ? (
            <span className="border-y-2 border-white w-4 h-4 rounded-full animate-spin" />
          ) : (
            <p>Update Profile</p>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default Profile;
