import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { sendResponse } from "../utils/apiResponse";
import {
  subscribeNewsletterSchema,
  updateSubscriberStatusSchema,
} from "../validators/newsletter.validator";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { getPagination, calculatePagination } from "../utils/pagination";
import { NewsletterStatus } from "@prisma/client";
import { sendEmail, renderEmailShell } from "../services/email";
import logger from "../utils/logger";

export const subscribeNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = subscribeNewsletterSchema.parse(req.body);

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === NewsletterStatus.SUBSCRIBED) {
        return sendResponse({
          res,
          status: 200,
          success: true,
          data: existing,
          message: "You are already subscribed to The Curator editorial.",
        });
      }

      const updated = await prisma.newsletterSubscriber.update({
        where: { email },
        data: { status: NewsletterStatus.SUBSCRIBED },
      });

      return sendResponse({
        res,
        status: 200,
        success: true,
        data: updated,
        message: "Welcome back. Your subscription has been reactivated.",
      });
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        status: NewsletterStatus.SUBSCRIBED,
      },
    });

    return sendResponse({
      res,
      status: 201,
      success: true,
      data: subscriber,
      message: "Welcome. You are now subscribed to our private dispatches.",
    });
  } catch (error) {
    next(error);
  }
};

export const unsubscribeNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = subscribeNewsletterSchema.parse(req.body);

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      throw new NotFoundError("Subscriber not found with this email");
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { email },
      data: { status: NewsletterStatus.UNSUBSCRIBED },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: updated,
      message: "You have been successfully unsubscribed.",
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscribers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const status = req.query.status as NewsletterStatus | undefined;

    const { skip } = getPagination({ page, limit });

    const where: {
      status?: NewsletterStatus;
      email?: { contains: string; mode: "insensitive" };
    } = {};

    if (status && Object.values(NewsletterStatus).includes(status)) {
      where.status = status;
    }

    if (search && search.trim().length > 0) {
      where.email = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    const [total, subscribers, totalActive, totalUnsubscribed] =
      await Promise.all([
        prisma.newsletterSubscriber.count({ where }),
        prisma.newsletterSubscriber.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.newsletterSubscriber.count({
          where: { status: NewsletterStatus.SUBSCRIBED },
        }),
        prisma.newsletterSubscriber.count({
          where: { status: NewsletterStatus.UNSUBSCRIBED },
        }),
      ]);

    const pagination = calculatePagination(total, page, limit);

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: {
        subscribers,
        stats: {
          total: totalActive + totalUnsubscribed,
          active: totalActive,
          unsubscribed: totalUnsubscribed,
        },
      },
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscriberStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = updateSubscriberStatusSchema.parse(req.body);

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Subscriber not found");
    }

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { status: status as NewsletterStatus },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: updated,
      message: `Subscriber status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscriber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Subscriber not found");
    }

    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: null,
      message: "Subscriber removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const exportSubscribers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    return sendResponse({
      res,
      status: 200,
      success: true,
      data: subscribers,
      message: "Subscribers exported successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const broadcastNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subject, previewText, content } = req.body;

    if (!subject || !content) {
      throw new ValidationError(
        "Subject and content are required to dispatch newsletter"
      );
    }

    const activeSubscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: NewsletterStatus.SUBSCRIBED },
      select: { email: true },
    });

    if (activeSubscribers.length === 0) {
      return sendResponse({
        res,
        status: 200,
        success: true,
        message: "No active subscribers found",
        data: { sentCount: 0 },
      });
    }

    const htmlContent = `
      <div style="font-size: 14px; line-height: 1.7; color: #27272a; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        ${content}
      </div>
      <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #71717a; text-align: center;">
        <p>You received this private dispatch because you are subscribed to The Curator Atelier Editorial.</p>
      </div>
    `;

    const emails = activeSubscribers.map((s) => s.email);
    for (const email of emails) {
      sendEmail(
        email,
        subject,
        renderEmailShell(subject, previewText || subject, htmlContent)
      ).catch((err) => {
        logger.error(`Failed to send newsletter dispatch to ${email}:`, {
          err,
        });
      });
    }

    return sendResponse({
      res,
      status: 200,
      success: true,
      message: `Editorial dispatch queued to ${emails.length} subscribers`,
      data: { sentCount: emails.length },
    });
  } catch (error) {
    next(error);
  }
};
