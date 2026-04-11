const path = require("node:path");
const { execSync } = require("node:child_process");
const { Client } = require("pg");
const dotenv = require("dotenv");

const DEFAULT_TEST_SCHEMA = "fashion_store_test";
const rootDir = path.resolve(__dirname, "../..");

const deriveSchemaScopedUrl = (connectionString, schema = DEFAULT_TEST_SCHEMA) => {
  if (!connectionString) {
    return undefined;
  }

  const url = new URL(connectionString);
  url.searchParams.set("schema", schema);
  return url.toString();
};

const getSchemaName = (connectionString) => {
  const url = new URL(connectionString);
  return url.searchParams.get("schema") || "public";
};

const ensureSchemaExists = async (connectionString) => {
  const client = new Client({ connectionString });
  const schema = getSchemaName(connectionString);

  await client.connect();

  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  } finally {
    await client.end();
  }
};

const main = async () => {
  dotenv.config({ path: path.join(rootDir, ".env") });

  const databaseUrlTest =
    process.env.DATABASE_URL_TEST ??
    deriveSchemaScopedUrl(process.env.DATABASE_URL, DEFAULT_TEST_SCHEMA);

  const directUrlTest =
    process.env.DIRECT_URL_TEST ??
    deriveSchemaScopedUrl(process.env.DIRECT_URL ?? process.env.DATABASE_URL, DEFAULT_TEST_SCHEMA);

  if (!databaseUrlTest) {
    throw new Error(
      "DATABASE_URL_TEST is required. Set a dedicated test database URL or provide DATABASE_URL so a schema-scoped fallback can be derived."
    );
  }

  const prismaEnv = {
    ...process.env,
    NODE_ENV: "test",
    DATABASE_URL_TEST: databaseUrlTest,
    DIRECT_URL_TEST: directUrlTest ?? databaseUrlTest,
    DATABASE_URL: databaseUrlTest,
    DIRECT_URL: directUrlTest ?? databaseUrlTest,
    JWT_SECRET: process.env.JWT_SECRET || "test-jwt-secret",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "test-refresh-secret",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "sk_test_mock",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "test-cloud",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "test-cloudinary-key",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "test-cloudinary-secret",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  };

  await ensureSchemaExists(prismaEnv.DIRECT_URL);

  execSync("npx prisma migrate deploy", {
    cwd: rootDir,
    stdio: "inherit",
    env: prismaEnv,
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
