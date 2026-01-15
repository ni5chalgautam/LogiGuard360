import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PendingSignup from "../models/PendingSignup.js";
import AuditLog from "../models/AuditLog.js";
import { makeId } from "../utils/ids.js";
import { sendVerificationCode } from "../utils/mailer.js";
import { OAuth2Client } from "google-auth-library";

function signToken(user){
  return jwt.sign(
    { userId: user.userId, role: user.role, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

function normalizeRole(role){
  const allowed = ["systemAdministrator","warehouseManager","logisticsStaff"];
  return allowed.includes(role) ? role : "logisticsStaff";
}

function makeCode(){
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}
// Google OAuth client (Continue with Google)
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// STEP 1: Send code (expires in 2 minutes)
export async function register(req, res, next){
  try{
    const { username, email, password, role } = req.body || {};
    if(!username || !email || !password){
      return res.status(400).json({ message: "username, email, password are required" });
    }

    const normEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email: normEmail });
    if(exists) return res.status(409).json({ message: "Email already registered" });

    const code = makeCode();
    const passwordHash = await bcrypt.hash(String(password), 10);
    const codeHash = await bcrypt.hash(code, 10);

    // ✅ EXPIRES IN 2 MINUTES
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await PendingSignup.findOneAndUpdate(
      { email: normEmail },
      {
        email: normEmail,
        username: String(username).trim(),
        role: normalizeRole(role),
        passwordHash,
        codeHash,
        expiresAt,
        attempts: 0
      },
      { upsert: true, new: true }
    );

    await sendVerificationCode({ to: normEmail, code });

    return res.status(200).json({
      message: "Verification code sent. Enter code to complete registration.",
      email: normEmail,
      expiresInMinutes: 2
    });
  }catch(err){
    next(err);
  }
}

// STEP 2: Verify code -> create user
export async function verifyRegister(req, res, next){
  try{
    const { email, code } = req.body || {};
    if(!email || !code) return res.status(400).json({ message: "email and code are required" });

    const normEmail = String(email).toLowerCase().trim();
    const pending = await PendingSignup.findOne({ email: normEmail });
    if(!pending) return res.status(400).json({ message: "No pending signup. Request a new code." });

    if(pending.expiresAt.getTime() < Date.now()){
      await PendingSignup.deleteOne({ email: normEmail });
      return res.status(400).json({ message: "Code expired. Request a new code." });
    }

    const ok = await bcrypt.compare(String(code), pending.codeHash);
    if(!ok){
      pending.attempts += 1;
      await pending.save();

      if(pending.attempts >= 5){
        await PendingSignup.deleteOne({ email: normEmail });
        return res.status(400).json({ message: "Too many attempts. Request a new code." });
      }
      return res.status(400).json({ message: "Invalid code" });
    }

    const user = await User.create({
      userId: makeId("U"),
      username: pending.username,
      email: pending.email,
      passwordHash: pending.passwordHash,
      role: pending.role,
      isActive: false
    });

    await PendingSignup.deleteOne({ email: normEmail });

    await AuditLog.create({
      id: makeId("A"),
      action: "REGISTER_VERIFIED",
      actor: user.userId,
      meta: { email: user.email, role: user.role }
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: user.toSafeJSON() });
  }catch(err){
    next(err);
  }
}

export async function login(req, res, next){
  try{
    const { email, password } = req.body || {};
    if(!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if(!user) return res.status(401).json({ message: "Invalid credentials" });
    if(!user.isActive) return res.status(403).json({ message: "Account pending admin approval" });


    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if(!ok) return res.status(401).json({ message: "Invalid credentials" });

    await AuditLog.create({ id: makeId("A"), action: "LOGIN", actor: user.userId });

    const token = signToken(user);
    return res.status(200).json({ token, user: user.toSafeJSON() });
  }catch(err){
    next(err);
  }
}
// POST /api/auth/google
// body: { credential: "<google_id_token>" }
export async function googleLogin(req, res, next){
  try{
    const { credential } = req.body || {};
    if(!credential) return res.status(400).json({ message: "Missing Google credential" });

    if(!process.env.GOOGLE_CLIENT_ID){
      return res.status(500).json({ message: "GOOGLE_CLIENT_ID not set in .env" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = String(payload?.email || "").toLowerCase().trim();
    const username = payload?.name || email.split("@")[0];

    if(!email) return res.status(400).json({ message: "Google account has no email" });

    let user = await User.findOne({ email });

    // Create new user if not exists
    if(!user){
      // your User model requires passwordHash, so set a random hash
      const randomHash = await bcrypt.hash("google_" + Date.now(), 10);

      user = await User.create({
        userId: makeId("U"),
        username,
        email,
        passwordHash: randomHash,
        role: "logisticsStaff",
        isActive: false
      });

      await AuditLog.create({
        id: makeId("A"),
        action: "REGISTER_GOOGLE",
        actor: user.userId,
        meta: { email: user.email, role: user.role }
      });
    }

   if(!user.isActive) return res.status(403).json({ message: "Account pending admin approval" });


    await AuditLog.create({ id: makeId("A"), action: "LOGIN_GOOGLE", actor: user.userId });

    const token = signToken(user);
    return res.status(200).json({ token, user: user.toSafeJSON() });
  }catch(err){
    next(err);
  }
}

