import { Router } from "express";
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
  exportSubscribers,
  broadcastNewsletter,
} from "../controllers/newsletter.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/subscribe", subscribeNewsletter);
router.post("/unsubscribe", unsubscribeNewsletter);

// Admin protected routes
router.get("/", authMiddleware, adminMiddleware, getSubscribers);
router.get("/export", authMiddleware, adminMiddleware, exportSubscribers);
router.post("/broadcast", authMiddleware, adminMiddleware, broadcastNewsletter);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateSubscriberStatus
);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSubscriber);

export default router;
