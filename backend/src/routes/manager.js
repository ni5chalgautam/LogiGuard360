import { Router } from "express";
import { configureWarehouse } from "../controllers/managerController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.post("/warehouse/configure", requireRole(["warehouseManager"]), configureWarehouse);

export default router;
