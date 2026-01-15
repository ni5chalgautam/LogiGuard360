import { Router } from "express";
import auth from "./auth.js";
import dashboard from "./dashboard.js";
import training from "./training.js";
import warehouses from "./warehouses.js";
import reports from "./reports.js";
import feedback from "./feedback.js";
import hotspotDetector from "./hotspotDetector.js";
import admin from "./admin.js";
import manager from "./manager.js";
import quizRoutes from "./quizRoutes.js";

const router = Router();

router.use("/auth", auth);
router.use("/dashboard", dashboard);
router.use("/training", training);
router.use("/warehouses", warehouses);
router.use("/reports", reports);
router.use("/feedback", feedback);
router.use("/hotspotDetector", hotspotDetector);
router.use("/admin", admin);
router.use("/manager", manager);
router.use("/quiz", quizRoutes);

export default router;
