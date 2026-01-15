import { Router } from "express";
import { generateReport } from "../controllers/reportController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { quizReport } from "../controllers/quizController.js";

const router = Router();
router.use(requireAuth);
router.post("/generate", requireRole(["systemAdministrator", "warehouseManager"]), generateReport);
router.get("/quiz", quizReport);

export default router;
