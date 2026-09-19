import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default("http://localhost:5000/api"),
  NEXT_PUBLIC_STRIPE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_STRIPE_KEY is required")
    .refine(
      (val) => val.startsWith("pk_"),
      "NEXT_PUBLIC_STRIPE_KEY must be a valid Stripe publishable key starting with pk_"
    ),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
});

const serverEnvSchema = clientEnvSchema.extend({
  JWT_SECRET: z.string().optional(),
  ANALYZE: z.enum(["true", "false"]).optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const validateClientEnv = (): ClientEnv => {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });

  if (!result.success) {
    console.error(
      "❌ [Frontend] Invalid environment variables:\n",
      JSON.stringify(result.error.format(), null, 2)
    );
    throw new Error(
      "Invalid frontend environment variables. Please check your frontend/.env file."
    );
  }

  return result.data;
};

export const validateServerEnv = (): ServerEnv => {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "❌ [Frontend] Invalid build/server environment variables:\n",
      JSON.stringify(result.error.format(), null, 2)
    );
    throw new Error(
      "Invalid frontend environment variables. Please check your frontend/.env file."
    );
  }

  return result.data;
};

// Automatically validate client environment when this module is loaded
export const env = validateClientEnv();
