import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema(
  {
    attemptId: { type: String, index: true },
    userId: { type: String, index: true, required: true },
    email: { type: String, default: "" },

    warehouseId: { type: String, default: "WH-001" },
    hotspotKey: { type: String, required: true }, // e.g. "phishing_emails"
    hotspotName: { type: String, default: "" },   // e.g. "Phishing Emails"

    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    percent: { type: Number, required: true } // 0..100
  },
  { timestamps: true }
);

export default mongoose.model("QuizAttempt", QuizAttemptSchema);