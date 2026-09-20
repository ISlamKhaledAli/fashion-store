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
  getAdminRentals,
  updateAdminRentalStatus,
  refundRentalDeposit,
  addRentalLateFee,
  getRentalAnalytics,
  getStoreSettings,
  updateStoreSetting,
  getShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  getAuditLogs,
  updateOrderInternalNotes,
  cancelOrder,
  getCustomer360,
  updateCustomerDetails,
} from "../controllers/admin.controller";
import {
  getAdminProducts,
  bulkUpdateProductStatus,
  bulkDeleteProducts,
} from "../controllers/product.controller";
import {
  getAdminReviews,
  updateReviewStatus,
  replyToReview,
  adminDeleteReview,
} from "../controllers/review.controller";
import {
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/reviews", getAdminReviews);
router.patch("/reviews/:id/status", updateReviewStatus);
router.put("/reviews/:id/status", updateReviewStatus);
router.post("/reviews/:id/reply", replyToReview);
router.delete("/reviews/:id", adminDeleteReview);

router.get("/categories", getAdminCategories);
router.post("/categories/reorder", reorderCategories);
router.get("/orders", getAdminOrders);
router.put("/orders/:id", updateOrderStatus);
router.put("/orders/:id/notes", updateOrderInternalNotes);
router.post("/orders/:id/cancel", cancelOrder);
router.post("/orders/bulk-status", bulkUpdateOrdersStatus);
router.post("/orders/bulk-delete", bulkDeleteOrders);
router.get("/products", getAdminProducts);
router.post("/products/bulk-status", bulkUpdateProductStatus);
router.post("/products/bulk-delete", bulkDeleteProducts);
router.get("/audit-logs", getAuditLogs);
router.get("/customers", getCustomers);
router.get("/customers/:id/360", getCustomer360);
router.put("/customers/:id/details", updateCustomerDetails);
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

// Rentals Admin
router.get("/rentals/analytics", getRentalAnalytics);
router.get("/rentals", getAdminRentals);
router.put("/rentals/:id/status", updateAdminRentalStatus);
router.post("/rentals/:id/deposit", refundRentalDeposit);
router.post("/rentals/:id/late-fee", addRentalLateFee);

// Store Settings Admin
router.get("/settings", getStoreSettings);
router.put("/settings/:key", updateStoreSetting);

// Shipping Zones Admin
router.get("/shipping-zones", getShippingZones);
router.post("/shipping-zones", createShippingZone);
router.put("/shipping-zones/:id", updateShippingZone);
router.delete("/shipping-zones/:id", deleteShippingZone);

// Banners Admin
router.get("/banners", getAdminBanners);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);

export default router;
