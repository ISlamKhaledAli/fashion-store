import { prisma } from "../lib/prisma";
import logger from "../utils/logger";
import { RentalStatus } from "@prisma/client";
import cron from "node-cron";

export const checkRentalExpiry = async () => {
  logger.info("Running rental expiry verification job...");

  const now = new Date();

  try {
    const overdueRentals = await prisma.rental.findMany({
      where: {
        status: RentalStatus.ACTIVE,
        endDate: { lt: now },
      },
      include: {
        user: true,
        product: true,
        variant: true,
      },
    });

    if (overdueRentals.length === 0) {
      logger.info("No overdue rentals found.");
      return;
    }

    logger.info(
      `Found ${overdueRentals.length} overdue rentals. Updating statuses and notifying.`
    );

    for (const rental of overdueRentals) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.rental.update({
            where: { id: rental.id },
            data: { status: RentalStatus.OVERDUE },
          });

          // Customer notification
          await tx.notification.create({
            data: {
              userId: rental.userId,
              type: "RENTAL_OVERDUE",
              title: "Rental Return Overdue",
              message: `Your rental of "${rental.product.name}" was due on ${rental.endDate.toLocaleDateString()}. Please initiate a return or contact support.`,
              data: { rentalId: rental.id, productId: rental.productId },
            },
          });

          // Admin notification
          await tx.notification.create({
            data: {
              userId: null,
              type: "ADMIN_RENTAL_OVERDUE",
              title: "Rental Overdue Alert",
              message: `Rental #${rental.id.slice(-6)} for customer ${rental.user.email} is overdue.`,
              data: { rentalId: rental.id, userId: rental.userId },
            },
          });
        });

        logger.info(`Marked rental ${rental.id} as OVERDUE`);
      } catch (err: any) {
        logger.error(`Failed to update overdue rental ${rental.id}:`, {
          message: err.message,
        });
      }
    }
  } catch (error: any) {
    logger.error("Rental expiry job encountered an error:", {
      message: error.message,
    });
  }
};

export const setupRentalExpiryJobs = () => {
  logger.info("Initializing rental expiry cron job...");
  // Runs every hour at minute 15
  cron.schedule("15 * * * *", async () => {
    await checkRentalExpiry();
  });
};
