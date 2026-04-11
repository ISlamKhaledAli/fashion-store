import "dotenv/config";
import { validateEnv, env } from "./utils/validateEnv";
// Call validation immediately before anything else
validateEnv();

import app from "./app.module";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import logger from "./utils/logger";

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const PORT = env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error("❌ Database connection failed:", { error });
    process.exit(1);
  }
}

main();

export { prisma };
