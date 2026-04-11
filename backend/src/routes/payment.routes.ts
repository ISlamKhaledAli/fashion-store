import express, { Router } from "express";
import { stripeWebhook } from "../controllers/payment.controller";

const router = Router();

// Webhook needs raw body for signature verification
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
