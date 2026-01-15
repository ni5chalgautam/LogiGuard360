import { Router } from "express";
import { submitQuiz } from "../controllers/quizController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/submit", submitQuiz);

export default router;