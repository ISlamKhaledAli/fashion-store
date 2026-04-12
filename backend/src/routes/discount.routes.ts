import { Router } from "express";
import { validateDiscount } from "../controllers/discount.controller";

const router = Router();

router.post("/validate", validateDiscount);

export default router;
