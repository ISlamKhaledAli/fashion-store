import { prisma } from "../lib/prisma";
import logger from "../utils/logger";
import { sendEmail } from "../services/email";
import cron from "node-cron";

export const runAbandonedCartRecovery = async () => {
  try {
    // 1. Fetch store settings
    const settings = await prisma.storeSettings.findMany({
      where: {
        key: {
          in: [
            "enableAbandonedCartRecovery",
            "abandonedCartEmailDelay",
            "abandonedCartDiscountPercent",
          ],
        },
      },
    });

    const settingsMap = settings.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, any>
    );

    const isEnabled = settingsMap.enableAbandonedCartRecovery ?? true;
    if (!isEnabled) {
      return;
    }

    const delayMinutes = Number(settingsMap.abandonedCartEmailDelay) || 60;
    const discountPercent =
      Number(settingsMap.abandonedCartDiscountPercent) || 5;

    const cutoffDate = new Date(Date.now() - delayMinutes * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // 2. Find carts that have items and haven't been modified recently
    const carts = await prisma.cart.findMany({
      where: {
        updatedAt: { lte: cutoffDate },
        items: { some: {} },
      },
      include: {
        user: true,
        items: {
          include: {
            variant: {
              include: { product: { include: { images: true } } },
            },
          },
        },
      },
    });

    if (carts.length === 0) {
      return;
    }

    logger.info(
      `[AbandonedCartRecovery] Found ${carts.length} candidate carts to evaluate.`
    );

    for (const cart of carts) {
      const user = cart.user;
      if (!user || !user.email) continue;

      // Check if user completed an order after cart was last updated
      const recentOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          createdAt: { gte: cart.updatedAt },
        },
      });
      if (recentOrder) continue;

      // Guard: Check if recovery notification was already sent in last 48 hours
      const recentRecovery = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: "ABANDONED_CART_RECOVERY",
          createdAt: { gte: fortyEightHoursAgo },
        },
      });
      if (recentRecovery) continue;

      // Compose recovery email
      const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      const firstItem =
        cart.items[0]?.variant?.product?.name || "curated piece";
      const couponCode = `RECOVER${discountPercent}`;

      const emailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafaf9; color: #1c1917;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="letter-spacing: 0.15em; font-size: 24px; text-transform: uppercase; margin: 0;">The Curator</h1>
            <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #78716c; margin-top: 4px;">Archival Atelier</p>
          </div>
          <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 4px; padding: 32px;">
            <h2 style="font-size: 20px; font-weight: 500; margin-top: 0; margin-bottom: 16px;">Your curated selection is waiting</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
              Hello ${user.name || "Collector"},<br><br>
              We noticed you left ${itemCount} item(s) in your bag, including <strong>${firstItem}</strong>.
              Archival pieces and seasonal releases maintain limited atelier allocation.
            </p>
            ${
              discountPercent > 0
                ? `
            <div style="background-color: #f5f5f4; border-left: 3px solid #1c1917; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; font-size: 13px; color: #1c1917; font-weight: 500;">
                Enjoy an exclusive ${discountPercent}% courtesy reduction on this selection:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 700; letter-spacing: 0.05em; color: #1c1917;">
                Code: <span style="font-family: monospace; background: #e7e5e4; padding: 2px 6px; border-radius: 3px;">${couponCode}</span>
              </p>
            </div>
            `
                : ""
            }
            <div style="text-align: center; margin-top: 32px;">
              <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/cart" style="background-color: #1c1917; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 13px; font-weight: 500; letter-spacing: 0.05em; border-radius: 2px; display: inline-block;">
                Complete Your Selection
              </a>
            </div>
          </div>
          <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #a8a29e;">
            © ${new Date().getFullYear()} The Curator Atelier. All rights reserved.
          </div>
        </div>
      `;

      try {
        await sendEmail(
          user.email,
          `Your Bag Awaits | The Curator Archival Atelier`,
          emailHtml
        );

        // Record in-app notification & deduplication audit
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "ABANDONED_CART_RECOVERY",
            title: "Your Curated Bag Awaits",
            message: `You left ${itemCount} piece(s) in your bag. Complete your purchase with code ${couponCode} for ${discountPercent}% off.`,
            data: {
              cartId: cart.id,
              discountPercent,
              couponCode,
            },
          },
        });

        logger.info(
          `[AbandonedCartRecovery] Sent recovery notification to ${user.email} (cart: ${cart.id})`
        );
      } catch (sendErr: any) {
        logger.warn(
          `[AbandonedCartRecovery] Could not dispatch email to ${user.email}: ${sendErr.message}`
        );
      }
    }
  } catch (err: any) {
    logger.error("[AbandonedCartRecovery] Job encountered an error:", {
      message: err.message,
    });
  }
};

export const setupAbandonedCartRecoveryJobs = () => {
  // Run every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    await runAbandonedCartRecovery();
  });
  logger.info("🕒 Abandoned cart recovery job scheduled (every 30m)");
};
