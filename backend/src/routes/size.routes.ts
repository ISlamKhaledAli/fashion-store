import { Router } from "express";
import { optionalAuthMiddleware } from "../middleware/auth";
import {
  handleSizeRecommend,
  getMeasurements,
  updateMeasurements,
  clearMeasurements,
} from "../controllers/size.controller";

const router = Router();

router.post("/recommend", optionalAuthMiddleware, handleSizeRecommend);
router.get("/measurements", optionalAuthMiddleware, getMeasurements);
router.put("/measurements", optionalAuthMiddleware, updateMeasurements);
router.delete("/measurements", optionalAuthMiddleware, clearMeasurements);

export default router;
