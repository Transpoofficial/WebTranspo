"use client";
import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signupSchema, SignupValues } from "@/utils/schema/user";
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
import Image from "next/image";

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
      phoneNumber: "",
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
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
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
                        <Input placeholder="example@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        We'll never share your email with anyone else.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0832182126121" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a valid phone number to stay connected.
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
                        Choose a strong password to keep your account secure.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Re-enter your password to confirm.
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
                    <p>Sign Up</p>
                  )}
                </Button>
              </form>
            </Form>

            <div className="w-full text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/auth/signin" className="text-primary underline">
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
