import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, calculateTotals, getShippingMethods } from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/add", addToCart);
router.get("/shipping-methods", getShippingMethods);
router.post("/calculate", calculateTotals);
router.put("/update", updateCartItem);
router.delete("/remove/:cartItemId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
