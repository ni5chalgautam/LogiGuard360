import { Router } from "express";
import { detect, calibrate } from "../controllers/hotspotDetectorController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.post("/detect", requireRole(["systemAdministrator","warehouseManager"]), detect);
router.post("/calibrate", requireRole(["systemAdministrator","warehouseManager"]), calibrate);

export default router;
