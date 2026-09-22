import { Router } from "express";
import {
  checkAvailability,
  getRentalSalons,
  createRental,
  getUserRentals,
  getRentalById,
  requestRentalReturn,
  cancelRental,
  confirmRentalPayment,
} from "../controllers/rental.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";

const router = Router();

// Public salons endpoint
router.get("/salons", optionalAuthMiddleware, getRentalSalons);

// Availability can be checked by guests
router.get(
  "/availability/:variantId",
  optionalAuthMiddleware,
  checkAvailability
);

// Customer rental endpoints
router.post("/", authMiddleware, createRental);
router.get("/", authMiddleware, getUserRentals);
router.get("/:id", authMiddleware, getRentalById);
router.put("/:id/payment", authMiddleware, confirmRentalPayment);
router.post("/:id/return", authMiddleware, requestRentalReturn);
router.put("/:id/cancel", authMiddleware, cancelRental);

export default router;
