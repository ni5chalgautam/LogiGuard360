import mongoose from "mongoose";

const PendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, required: true, trim: true },
    role: { type: String, default: "logisticsStaff" },
    passwordHash: { type: String, required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// auto-delete expired records
PendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PendingSignup", PendingSignupSchema);
