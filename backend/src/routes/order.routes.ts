import { Router } from "express";
import { getOrders, getOrderById, createOrder, cancelOrder, updateOrderPayment } from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id/payment", updateOrderPayment);
router.put("/:id/cancel", cancelOrder);


export default router;
