"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const isFromCheckout = redirect === "/checkout";

  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const response = await authApi.login(data);
      if (response.data.success) {
        const { user } = response.data.data;
        login({ user });
        router.push(redirect || "/");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Invalid credentials. Please try again.";
      setError(errorMessage || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        className="w-full max-w-md space-y-12"
      >
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-medium tracking-tighter text-on-surface">
            Welcome Back
          </h1>
          <p className="text-sm font-bold tracking-[0.2em] text-on-surface-variant uppercase">
            {isFromCheckout
              ? "Please sign in to complete your purchase"
              : "Access your curated artifacts"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          {error && (
            <p className="text-center text-[10px] font-extrabold tracking-widest text-error uppercase">
              {error}
            </p>
          )}

          <div className="space-y-6">
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign In
            </Button>
            <div className="text-center">
              <Link
                href="/register"
                className="text-xs text-on-surface-variant underline underline-offset-4 transition-colors hover:text-primary"
              >
                Create an account instead
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
