import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "../utils/validateEnv";
import logger from "../utils/logger";

const connectionString = env.DATABASE_URL;
// pg.Pool ignores the ?schema= URL param (Prisma-only concept).
// Extract it and set search_path explicitly so queries target the correct schema.
const dbUrl = new URL(connectionString);
const schema = dbUrl.searchParams.get("schema");
const poolConfig: pg.PoolConfig = {
  connectionString,
  options: schema ? `-c search_path=${schema}` : undefined,
};

const pool = new pg.Pool(poolConfig);

if (schema) {
  pool.on("connect", (client) => {
    client.query(`SET search_path TO ${schema}`).catch((err) => {
      logger.error(`Failed to set search_path to ${schema}:`, { error: err });
    });
  });
}

const maskedUrl = connectionString
  ? connectionString.replace(/:[^:@]+@/, ":****@")
  : "";
logger.info("Prisma Client initialized", {
  schema: schema || "public",
  url: maskedUrl,
});

const adapter = new PrismaPg(pool, { schema: schema || undefined });

export const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
  await pool.end();
};
