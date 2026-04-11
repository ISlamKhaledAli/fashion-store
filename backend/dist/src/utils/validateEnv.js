"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    DIRECT_URL: zod_1.z.string().url().optional(),
    DATABASE_URL_TEST: zod_1.z.string().url().optional(),
    DIRECT_URL_TEST: zod_1.z.string().url().optional(),
    JWT_SECRET: zod_1.z.string().min(1, "JWT_SECRET is required"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1, "JWT_REFRESH_SECRET is required"),
    STRIPE_SECRET_KEY: zod_1.z.string().startsWith("sk_", "STRIPE_SECRET_KEY must start with sk_"),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_"),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1, "CLOUDINARY_API_SECRET is required"),
    CLIENT_URL: zod_1.z.string().url(),
    PORT: zod_1.z.string().default("5000"),
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    // Email variables
    EMAIL_HOST: zod_1.z.string().optional(),
    EMAIL_PORT: zod_1.z.string().optional(),
    EMAIL_SECURE: zod_1.z.string().optional(),
    EMAIL_USER: zod_1.z.string().optional(),
    EMAIL_PASS: zod_1.z.string().optional(),
});
const loadEnv = () => {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error("❌ Invalid environment variables:", parsed.error.format());
        process.exit(1);
    }
    return parsed.data;
};
exports.env = loadEnv();
const validateEnv = () => {
    exports.env = loadEnv();
    return exports.env;
};
exports.validateEnv = validateEnv;
