"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
import { CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password harus minimal 8 karakter")
      .max(100, "Password maksimal 100 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

// Component that uses useSearchParams - needs to be wrapped in Suspense
function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Token reset password tidak valid atau sudah kadaluarsa");
        setValidating(false);
        return;
      }

      try {
        await axios.post("/api/auth/validate-reset-token", { token });
        setTokenValid(true);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Token reset password tidak valid atau sudah kadaluarsa"
          );
        } else {
          setError("Terjadi kesalahan saat validasi token");
        }
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/auth/reset-password", {
        token,
        password: values.password,
      });
      setSuccess(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Terjadi kesalahan saat reset password."
        );
      } else {
        setError("Terjadi kesalahan tak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
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
            <div className="w-full max-w-xs text-center">
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Memvalidasi token reset password...
                </p>
              </div>
            </div>
          </div>
        </div>

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

  if (!tokenValid && error) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
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
                <AlertTriangle className="h-16 w-16 text-destructive" />

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Token Tidak Valid</h1>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>

                <div className="space-y-2 w-full">
                  <Button asChild className="w-full">
                    <Link href="/auth/forgot-password">
                      Minta Link Reset Baru
                    </Link>
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/signin">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali ke Login
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

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

  if (success) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
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
                  <h1 className="text-2xl font-bold">
                    Password Berhasil Direset!
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Password Anda telah berhasil diubah. Silakan login dengan
                    password baru.
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link href="/auth/signin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Login Sekarang
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

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
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Masukkan password baru untuk akun Anda
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Baru</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konfirmasi Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
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
                    {loading ? "Mereset..." : "Reset Password"}
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

// Loading component for Suspense fallback
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
