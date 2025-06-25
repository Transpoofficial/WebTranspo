"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/auth/forgot-password", values);
      setSuccess(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Terjadi kesalahan saat mengirim email reset password."
        );
      } else {
        setError("Terjadi kesalahan tak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Success Message */}
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <Image
                className="h-6 w-6"
                src={"/images/logo/logo_3.png"}
                alt="logo_3.png"
                width={100}
                height={100}
              />
              TRANSPO
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <div className="flex flex-col items-center gap-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Email Terkirim!</h1>
                  <p className="text-sm text-muted-foreground">
                    Kami telah mengirim link reset password ke email Anda.
                    Silakan cek inbox atau folder spam.
                  </p>
                </div>

                <div className="space-y-2 w-full">
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali ke Login
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSuccess(false);
                      form.reset();
                    }}
                  >
                    Kirim Ulang Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative hidden bg-muted lg:block">
          <Image
            src="/images/angkot/bg.png"
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            fill
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Forgot Password Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Image
              className="h-6 w-6"
              src={"/images/logo/logo_3.png"}
              alt="logo_3.png"
              width={100}
              height={100}
            />
            TRANSPO
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Lupa Password?</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Masukkan email Anda dan kami akan mengirim link untuk reset
                    password
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="example@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Mengirim..." : "Kirim Link Reset"}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Ingat password Anda?{" "}
                  <Link
                    href="/auth/signin"
                    className="underline underline-offset-4"
                  >
                    Masuk di sini
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/angkot/bg.png"
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill
        />
      </div>
    </div>
  );
}
