import { Router } from "express";
import { uploadImage, deleteImage } from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post("/image", upload.single("image"), uploadImage);
router.delete("/image", deleteImage);

export default router;
