import path from "node:path";
import dotenv from "dotenv";

const DEFAULT_TEST_SCHEMA = "fashion_store_test";

const deriveSchemaScopedUrl = (connectionString?: string, schema = DEFAULT_TEST_SCHEMA) => {
  if (!connectionString) {
    return undefined;
  }

  const url = new URL(connectionString);
  url.searchParams.set("schema", schema);
  return url.toString();
};

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const databaseUrlTest =
  process.env.DATABASE_URL_TEST ??
  deriveSchemaScopedUrl(process.env.DATABASE_URL, DEFAULT_TEST_SCHEMA);

const directUrlTest =
  process.env.DIRECT_URL_TEST ??
  deriveSchemaScopedUrl(process.env.DIRECT_URL ?? process.env.DATABASE_URL, DEFAULT_TEST_SCHEMA);

if (!databaseUrlTest) {
  throw new Error(
    "DATABASE_URL_TEST is required for tests. Provide a dedicated test database URL or allow the setup to derive one from DATABASE_URL."
  );
}

process.env.NODE_ENV = "test";
process.env.DATABASE_URL_TEST = databaseUrlTest;
process.env.DIRECT_URL_TEST = directUrlTest ?? databaseUrlTest;
process.env.DATABASE_URL = databaseUrlTest;
process.env.DIRECT_URL = directUrlTest ?? databaseUrlTest;
process.env.JWT_SECRET ||= "test-jwt-secret";
process.env.JWT_REFRESH_SECRET ||= "test-refresh-secret";
process.env.STRIPE_SECRET_KEY ||= "sk_test_mock";
process.env.STRIPE_WEBHOOK_SECRET ||= "whsec_mock";
process.env.CLOUDINARY_CLOUD_NAME ||= "test-cloud";
process.env.CLOUDINARY_API_KEY ||= "test-cloudinary-key";
process.env.CLOUDINARY_API_SECRET ||= "test-cloudinary-secret";
process.env.CLIENT_URL ||= "http://localhost:3000";
process.env.PORT ||= "5001";
process.env.EMAIL_HOST ||= "smtp.example.com";
process.env.EMAIL_PORT ||= "587";
process.env.EMAIL_SECURE ||= "false";
process.env.EMAIL_USER ||= "test@example.com";
process.env.EMAIL_PASS ||= "test-password";
