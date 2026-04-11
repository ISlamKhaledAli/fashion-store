import { Router } from "express";
import {
  getAdminOrders,
  updateOrderStatus,
  getCustomers,
  getAnalyticsOverview,
  getRevenueAnalytics,
  getTopProducts,
  getInventory,
  createDiscount,
  getDiscounts,
} from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/orders", getAdminOrders);
router.put("/orders/:id", updateOrderStatus);
router.get("/customers", getCustomers);
router.get("/analytics/overview", getAnalyticsOverview);
router.get("/analytics/revenue", getRevenueAnalytics);
router.get("/analytics/top-products", getTopProducts);
router.get("/inventory", getInventory);
router.post("/discounts", createDiscount);
router.get("/discounts", getDiscounts);

export default router;
