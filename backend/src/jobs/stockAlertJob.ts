import { prisma } from "../lib/prisma";
import logger from "../utils/logger";
import cron from "node-cron";

export const checkLowStock = async () => {
  logger.info("Running low stock monitoring job...");

  try {
    // Check if threshold custom setting exists
    const setting = await prisma.storeSettings.findUnique({
      where: { key: "lowStockThreshold" },
    });

    const threshold =
      setting?.value && typeof setting.value === "number" ? setting.value : 5;

    const lowStockVariants = await prisma.variant.findMany({
      where: {
        stock: { lte: threshold },
      },
      include: {
        product: true,
      },
    });

    if (lowStockVariants.length === 0) {
      logger.info("All variants have sufficient stock levels.");
      return;
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const v of lowStockVariants) {
      // Check if we already alerted about this variant in the past 24 hours
      const recentAlert = await prisma.notification.findFirst({
        where: {
          type: "LOW_STOCK",
          createdAt: { gte: oneDayAgo },
          data: {
            path: ["variantId"],
            equals: v.id,
          },
        },
      });

      if (!recentAlert) {
        await prisma.notification.create({
          data: {
            userId: null, // admin broadcast
            type: "LOW_STOCK",
            title: "Low Stock Alert",
            message: `Product "${v.product.name}" (${v.color} / ${v.size}) has only ${v.stock} unit(s) remaining!`,
            data: {
              variantId: v.id,
              productId: v.productId,
              sku: v.sku,
              stock: v.stock,
            },
          },
        });
        logger.info(
          `Emitted low stock alert for variant ${v.sku} (${v.stock} left)`
        );
      }
    }
  } catch (error: any) {
    logger.error("Error running low stock alert job:", {
      message: error.message,
    });
  }
};

export const setupStockAlertJobs = () => {
  logger.info("Initializing stock alert cron job...");
  // Runs every day at 08:00 AM
  cron.schedule("0 8 * * *", async () => {
    await checkLowStock();
  });
};
