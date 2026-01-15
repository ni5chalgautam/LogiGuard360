import { Router } from "express";
import { listWarehouses, listHotspots, getStatus } from "../controllers/warehouseController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", listWarehouses);
router.get("/:id/hotspots", listHotspots);
router.get("/:id/status", getStatus);

export default router;
