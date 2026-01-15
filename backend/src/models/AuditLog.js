import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true },
    actor: { type: String, default: "" },
    meta: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", AuditLogSchema);
