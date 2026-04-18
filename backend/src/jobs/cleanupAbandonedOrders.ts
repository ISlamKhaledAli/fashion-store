import { prisma } from "../lib/prisma";
import stripe from "../services/stripe";
import logger from "../utils/logger";
import cron from "node-cron";

export const cleanupAbandonedOrders = async () => {
  logger.info("Starting cleanup of abandoned orders...");
  
  // 30 minutes threshold
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  try {
    const stuckOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: thirtyMinutesAgo }
      },
      include: { items: true }
    });

    if (stuckOrders.length === 0) {
      logger.info("No abandoned orders found to cleanup.");
      return;
    }

    logger.info(`Found ${stuckOrders.length} abandoned orders. Cleaning up.`);

    for (const order of stuckOrders) {
      try {
        await prisma.$transaction(async (tx) => {
          // Increment stock safely
          for (const item of order.items) {
             await tx.variant.update({ 
               where: { id: item.variantId }, 
               data: { stock: { increment: item.quantity } } 
             });
          }
          // Mark order cancelled
          await tx.order.update({
             where: { id: order.id },
             data: { 
               status: "CANCELLED", 
               notes: order.notes ? `${order.notes} | Cancelled due to payment timeout` : "Cancelled due to payment timeout"
             }
          });
        });
        
        // Cancel Stripe intent if it exists
        if (order.stripePaymentId) {
           try {
             await stripe.paymentIntents.cancel(order.stripePaymentId);
           } catch (stripeErr: any) {
             // It might already be cancelled or succeeded before our DB check
             logger.warn(`Could not cancel Stripe Intent ${order.stripePaymentId} for order ${order.id}: ${stripeErr.message}`);
           }
        }
        
        logger.info(`Successfully cleaned up abandoned order ${order.id}`);
      } catch (orderErr: any) {
        logger.error(`Error cleaning up individual order ${order.id}:`, { message: orderErr.message });
      }
    }
  } catch (err: any) {
    logger.error("Failed to run abandoned orders cleanup job:", { message: err.message });
  }
};


export const setupCleanupJobs = () => {
  logger.info("Initializing cleanup jobs...");
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    await cleanupAbandonedOrders();
  });
};
