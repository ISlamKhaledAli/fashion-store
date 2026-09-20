import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  broadcastNotification,
  deleteNotification,
} from "../controllers/notification.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllNotificationsAsRead);
router.put("/:id/read", markNotificationAsRead);
router.delete("/:id", deleteNotification);
router.post("/broadcast", adminMiddleware, broadcastNotification);

export default router;
