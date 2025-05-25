"use client";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signupSchema, SignupValues } from "@/utils/schema/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const SignupPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupValues) => {
    setLoading(true);
    const response = await fetch("/api/auth/signup", {
      body: JSON.stringify(values),
      method: "POST",
    });
    if (!response.ok) {
      setLoading(false);
      const res = await response.json();
      setError(
        res?.message || "An error occurred while signing up. Please try again."
      );
    } else {
      signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      }).then((res) => {
        setLoading(false);
        if (!res?.ok) {
          setError(
            res?.error ||
              "An error occurred while signing in. Please try again."
          );
        } else {
          router.push("/dashboard");
        }
      });
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    await signIn("google", {
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  };

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Sign Up Form */}
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <Image
                className="h-6 w-6"
                src={"/logo_3.png"}
                alt="logo_3.png"
                width={100}
                height={100}
              />
              TRANSPO
            </Link>
          </div>

          {/* Sign Up Form */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Daftar akun baru</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                      Masukkan data dirimu untuk membuat akun
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {/* Full Name */}
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email */}
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

                    {/* Password */}
                    <div className="grid gap-2">
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Confirm Password */}
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
                      <p className="mb-4 md:mb-8 text-sm md:text-base text-red-500">
                        {error}
                      </p>
                    )}

                    <Button
                      disabled={loading}
                      className="cursor-pointer w-full"
                      type="submit"
                    >
                      {loading ? (
                        <span className="border-y-2 border-white w-4 h-4 rounded-full animate-spin" />
                      ) : (
                        <p>Daftar</p>
                      )}
                    </Button>

                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                      <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Atau lanjutkan dengan
                      </span>
                    </div>

                    {/* Button for sign up with Google */}
                    <Button
                      onClick={handleGoogleSignUp}
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Daftar dengan Google
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Sudah punya akun?{" "}
                    <Link
                      href="/auth/signin"
                      className="underline underline-offset-4"
                    >
                      Masuk
                    </Link>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* Signup Image */}
        <div className="relative hidden bg-muted lg:block">
          <img
            src="https://asset-2.tstatic.net/suryamalang/foto/bank/images/Sopir-Angkot-menggelar-aksi-unjuk-rasa-di-depan-Balai-Kota-Malang-Jawa-Timur.jpg "
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </>
  );
};

export default SignupPage;
