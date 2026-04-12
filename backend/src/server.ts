import "dotenv/config";
import { validateEnv, env } from "./utils/validateEnv";
import { prisma } from "./lib/prisma";
// Call validation immediately before anything else
validateEnv();

import app from "./app.module";
import logger from "./utils/logger";

const PORT = env.PORT || 5000;

export async function startServer() {
  try {
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    return app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error("❌ Database connection failed:", { error });
    process.exit(1);
  }
}

if (require.main === module) {
  void startServer();
}
export { app };
export default app;