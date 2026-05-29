import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "../utils/validateEnv";

const connectionString = env.DATABASE_URL;
// pg.Pool ignores the ?schema= URL param (Prisma-only concept).
// Extract it and set search_path explicitly so queries target the correct schema.
const dbUrl = new URL(connectionString);
const schema = dbUrl.searchParams.get("schema");
const poolConfig: pg.PoolConfig = { 
  connectionString,
  options: schema ? `-c search_path=${schema}` : undefined
};

const pool = new pg.Pool(poolConfig);

if (schema) {
  pool.on("connect", (client) => {
    client.query(`SET search_path TO ${schema}`).catch((err) => {
      console.error(`Failed to set search_path to ${schema}:`, err);
    });
  });
}

console.log("[PRISMA INIT] DATABASE_URL =", connectionString);
console.log("[PRISMA INIT] schema =", schema);
console.log("[PRISMA INIT] poolConfig =", JSON.stringify({ 
  ...poolConfig, 
  connectionString: poolConfig.connectionString?.replace(/:[^:@]+@/, ":****@") 
}));

const adapter = new PrismaPg(pool, { schema: schema || undefined });

export const prisma = new PrismaClient({ 
  adapter,
  log: ["query", "info", "warn", "error"]
});

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
  await pool.end();
};
