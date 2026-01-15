import { Router } from "express";
import { login, register, verifyRegister } from "../controllers/authController.js";
import { googleLogin } from "../controllers/authController.js";


const router = Router();

router.post("/login", login);

// step 1: send code
router.post("/register", register);

// step 2: verify code + create account
router.post("/register/verify", verifyRegister);

// Google OAuth login
router.post("/google", googleLogin);
export default router;
