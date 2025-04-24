"use client";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signinSchema, SigninValues } from "@/utils/schema/user";
import Image from "next/image";

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
  return (
    <>
      <div className="grid grid-cols-12 h-[100dvh]">
        <div className="hidden md:block md:col-span-7">
          <Image
            src="/bg.png"
            alt=""
            className="w-full h-full object-cover"
            width="100"
            height="100"
          />
        </div>

        <div className="col-span-12 md:col-span-5">
          <div className="h-full w-full flex flex-col justify-center items-center px-4 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-lg space-y-4 md:space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the email address associated with your account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormDescription>
                        Enter the password associated with your account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    <p>Sign In</p>
                  )}
                </Button>
              </form>
            </Form>

            <div className="w-full text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a href="/auth/signup" className="text-primary underline">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SigninPage;
