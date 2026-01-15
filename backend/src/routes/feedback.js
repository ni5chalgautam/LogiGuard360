import { Router } from "express";
import { createFeedback } from "../controllers/feedbackController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.post("/", createFeedback);

export default router;
