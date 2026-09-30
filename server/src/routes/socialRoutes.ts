import { Router } from "express";
import { socialController } from "../controllers/socialController.js";

const router = Router();

router.get("/instagram", socialController.getInstagramFeed);

export default router;
