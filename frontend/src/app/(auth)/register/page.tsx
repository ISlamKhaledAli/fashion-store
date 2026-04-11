"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      const response = await authApi.register(data);
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;
        setAuth(user, accessToken, refreshToken);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        className="w-full max-w-md space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-medium tracking-tighter text-on-surface">
            Join the Registry
          </h1>
          <p className="text-on-surface-variant text-sm uppercase tracking-[0.2em] font-bold">
            Curate your aesthetic journey
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <Input
              label="Full Name"
              placeholder="Alex Curator"
              {...register("name")}
              error={errors.name?.message}
            />
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
            <p className="text-[10px] text-error font-extrabold uppercase tracking-widest text-center">
              {error}
            </p>
          )}

          <div className="space-y-6">
            <Button 
                type="submit" 
                className="w-full" 
                isLoading={isSubmitting}
            >
              Initialize Account
            </Button>
            <div className="text-center">
              <Link 
                href="/login" 
                className="text-xs text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
              >
                Already registered? Sign in
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
