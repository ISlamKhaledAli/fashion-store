import { Router } from "express";
import { getProductReviews, createReview, updateReview, deleteReview } from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/product/:productId", getProductReviews);

router.use(authMiddleware);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
