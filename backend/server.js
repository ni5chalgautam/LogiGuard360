// server.js (Upgraded) — LogiGuard360 Backend
// - Serves frontend from /public
// - API mounted at /api
// - Friendly route handling for direct .html access (refresh-safe)
// - CORS configurable via .env
// - MongoDB + seed on startup

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import api from "./src/routes/index.js";
import { notFound, errorHandler } from "./src/middleware/error.js";
import { seedIfEmpty } from "./src/seed/seed.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// ---------- Middleware ----------
app.use(express.json({ limit: "1mb" }));
app.use(helmet({
  // ✅ IMPORTANT: allow Google popup to communicate back (prevents opener=null issues)
  crossOriginOpenerPolicy: { policy: "unsafe-none" },

  // ✅ (safe dev setting) prevents COEP issues with external resources/iframes
  crossOriginEmbedderPolicy: false,

  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'","'unsafe-inline'","https://cdn.jsdelivr.net","https://accounts.google.com","https://www.gstatic.com"],
      "script-src-elem": ["'self'","'unsafe-inline'","https://cdn.jsdelivr.net","https://accounts.google.com","https://www.gstatic.com"],
      "style-src": ["'self'","'unsafe-inline'","https://cdnjs.cloudflare.com","https://cdn.jsdelivr.net","https://accounts.google.com","https://www.gstatic.com"],
      "style-src-elem": ["'self'","'unsafe-inline'","https://cdnjs.cloudflare.com","https://cdn.jsdelivr.net","https://accounts.google.com","https://www.gstatic.com"],
      "frame-src": ["'self'","https://accounts.google.com"],
      "connect-src": ["'self'","https://accounts.google.com","https://www.gstatic.com","https://oauth2.googleapis.com"],
      "img-src": ["'self'","data:","blob:","https://accounts.google.com","https://www.gstatic.com","https://lh3.googleusercontent.com"],
      "font-src": ["'self'","https://cdnjs.cloudflare.com","data:"]
    }
  }
}));



app.use(morgan("dev"));

// CORS (for Live Server + any other allowed origins)
const origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// If CORS_ORIGINS is empty, allow all (dev-friendly)
app.use(
  cors({
    origin: origins.length ? origins : true,
    credentials: true,
  })
);

// ---------- DB Connect ----------
const mongo = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/logiguard360";

try {
  await mongoose.connect(mongo);
  console.log("✅ MongoDB connected:", mongo);
} catch (err) {
  console.error("❌ MongoDB connection failed:", err?.message || err);
  process.exit(1);
}

// Seed initial data/users
try {
  await seedIfEmpty();
  console.log("✅ Seed check completed");
} catch (err) {
  console.error("❌ Seed failed:", err?.message || err);
  // Not fatal — you can choose to exit if you want:
  // process.exit(1);
}

// ---------- API ----------
app.use("/api", api);

// ---------- Static Frontend ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

// Serve static assets/pages
app.use(express.static(publicDir, { extensions: ["html"] }));
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Home route should load Dashboard (index.html)
// (Dashboard itself redirects to login.html if not authenticated)
app.get("/", (req, res) => {
  return res.sendFile(path.join(publicDir, "index.html"));
});

// Allow direct access like /training.html, /reports.html etc.
app.get("/:page", (req, res, next) => {
  const page = req.params.page;

  // Only handle .html files; allow /api/* or other routes to continue
  if (!page.endsWith(".html")) return next();

  return res.sendFile(path.join(publicDir, page), (err) => {
    if (err) return next(); // will fall to notFound/errorHandler
  });
});

// ---------- Errors ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 LogiGuard360 backend running on http://localhost:${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}/`);
  console.log(`   API base: http://localhost:${PORT}/api`);
});
