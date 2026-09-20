import { Router } from "express";
import {
  createReturnRequest,
  getUserReturns,
  getAdminReturns,
  updateReturnStatus,
  processReturnRefund,
} from "../controllers/return.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();

// Customer routes
router.post("/", authMiddleware, createReturnRequest);
router.get("/", authMiddleware, getUserReturns);

// Admin routes
router.get("/admin", authMiddleware, adminMiddleware, getAdminReturns);
router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  updateReturnStatus
);
router.post(
  "/admin/:id/refund",
  authMiddleware,
  adminMiddleware,
  processReturnRefund
);

export default router;
