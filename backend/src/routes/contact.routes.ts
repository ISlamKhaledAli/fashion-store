import { Router } from "express";
import {
  submitContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../controllers/contact.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

// Public route to submit message
router.post("/", submitContactMessage);

// Admin protected routes
router.get("/", authMiddleware, adminMiddleware, getContactMessages);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateContactMessageStatus
);
router.delete("/:id", authMiddleware, adminMiddleware, deleteContactMessage);

export default router;
