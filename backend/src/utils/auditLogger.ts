import { Request } from "express";
import { prisma } from "../lib/prisma";
import logger from "./logger";

export interface LogAuditOptions {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown> | null;
  userId?: string;
  userName?: string;
}

/**
 * Fire-and-forget audit logger for admin activities.
 * Never throws or interrupts the HTTP request lifecycle.
 */
export const logAudit = (
  req: Request | null,
  options: LogAuditOptions
): void => {
  const ipAddress = req
    ? (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress
    : undefined;

  const effectiveUserId = options.userId || req?.user?.id;

  const execute = async () => {
    let resolvedName = options.userName;

    if (!resolvedName && effectiveUserId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: effectiveUserId },
          select: { name: true, email: true },
        });
        if (user) {
          resolvedName = user.name || user.email;
        }
      } catch {
        // Ignore user lookup error
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: effectiveUserId || null,
        userName: resolvedName || "System / Unknown",
        action: options.action,
        entity: options.entity,
        entityId: options.entityId || null,
        details: options.details ? (options.details as any) : undefined,
        ipAddress: ipAddress || null,
      },
    });
  };

  execute().catch((err) => {
    logger.warn("Failed to write audit log:", { error: err, options });
  });
};
