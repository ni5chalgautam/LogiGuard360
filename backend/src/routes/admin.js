import { Router } from "express";
import { listUsers, disableUser, enableUser, audit } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["systemAdministrator"]));

router.get("/users", listUsers);
router.post("/users/disable", disableUser);
router.post("/users/enable", enableUser);
router.get("/audit", audit);

export default router;
