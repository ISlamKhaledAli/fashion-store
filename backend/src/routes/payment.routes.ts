import express, { Router } from "express";
import { stripeWebhook, createIntent } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Webhook needs raw body for signature verification
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Intent needs parsed JSON body (payment routes are mounted before global express.json())
router.post("/intent", express.json(), authMiddleware, createIntent);

export default router;
