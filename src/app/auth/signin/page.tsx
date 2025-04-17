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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signinSchema, SigninValues } from "@/utils/schema/user";

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
    console.log({ values });
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
    <div className="h-[100dvh] w-full flex justify-center items-center px-4 py-4">
      <Card className="flex-grow max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your account and continue where you left off.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <p>Card Content</p>
           */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-8"
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
        </CardContent>
        <CardFooter>
          <div className="w-full text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-primary underline">
                Sign up
              </a>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SigninPage;
