"use client";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { signinSchema, SigninValues } from "@/utils/schema/user";
import Image from "next/image";
import Link from "next/link";

const SigninPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SigninValues) => {
    setLoading(true);
    const response = await signIn("credentials", {
      redirect: false,
      ...values,
    });
    setLoading(false);
    if (!response?.ok) {
      setError(
        response?.error ||
          "An error occurred while signing in. Please try again."
      );
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", {
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  };
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Login Form */}
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

          {/* Login Form */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
                    <p className="text-balance text-sm text-muted-foreground">
                      Masukkan email Anda di bawah untuk masuk ke akun Anda
                    </p>
                  </div>

                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      {/* Email input */}
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

                    <div className="grid gap-2">
                      {/* Password input */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center">
                              <FormLabel>Password</FormLabel>
                              <Link
                                href="#"
                                className="ml-auto text-sm underline-offset-4 hover:underline"
                              >
                                Lupa password?
                              </Link>
                            </div>

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
                        <p>Masuk</p>
                      )}
                    </Button>

                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                      <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Atau lanjutkan dengan
                      </span>
                    </div>

                    {/* Button for sign in with Google */}
                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
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
                      Masuk dengan Google
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Belum punya akun?{" "}
                    <Link
                      href="/auth/signup"
                      className="underline underline-offset-4"
                    >
                      Daftar
                    </Link>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* Login Image */}
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

export default SigninPage;
