import { Router } from "express";
import { listContent, assignTraining, getProgress } from "../controllers/trainingController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/content", listContent);
router.post("/assign", requireRole(["systemAdministrator","warehouseManager"]), assignTraining);
router.get("/progress", getProgress);

export default router;
