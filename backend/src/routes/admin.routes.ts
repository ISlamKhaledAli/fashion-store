import { Router } from "express";
import {
  getAdminOrders,
  getAdminCategories,
  reorderCategories,
  updateOrderStatus,
  getCustomers,
  updateCustomerStatus,
  deleteCustomer,
  getAnalyticsOverview,
  getRevenueAnalytics,
  getTopProducts,
  getInventory,
  updateInventoryStock,
  updateDiscount,
  deleteDiscount,
  createDiscount,
  getDiscounts,
  bulkUpdateOrdersStatus,
  bulkDeleteOrders,
  getGeographicData,
  getCategoryRevenue,
  getCustomerRetention,
} from "../controllers/admin.controller";
import { getAdminProducts } from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/categories", getAdminCategories);
router.post("/categories/reorder", reorderCategories);
router.get("/orders", getAdminOrders);
router.put("/orders/:id", updateOrderStatus);
router.post("/orders/bulk-status", bulkUpdateOrdersStatus);
router.post("/orders/bulk-delete", bulkDeleteOrders);
router.get("/products", getAdminProducts);
router.get("/customers", getCustomers);
router.put("/customers/:id/status", updateCustomerStatus);
router.delete("/customers/:id", deleteCustomer);
router.get("/analytics/overview", getAnalyticsOverview);
router.get("/analytics/revenue", getRevenueAnalytics);
router.get("/analytics/top-products", getTopProducts);
router.get("/analytics/geographic", getGeographicData);
router.get("/analytics/categories", getCategoryRevenue);
router.get("/analytics/retention", getCustomerRetention);
router.get("/inventory", getInventory);
router.put("/inventory/:variantId", updateInventoryStock);
router.post("/discounts", createDiscount);
router.get("/discounts", getDiscounts);
router.put("/discounts/:id", updateDiscount);
router.delete("/discounts/:id", deleteDiscount);

export default router;
