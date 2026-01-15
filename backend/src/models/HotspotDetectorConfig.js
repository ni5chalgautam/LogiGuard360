import mongoose from "mongoose";

const HotspotDetectorConfigSchema = new mongoose.Schema(
  {
    configId: { type: String, unique: true, index: true },
    threshold: { type: Number, default: 0.7 },
    notes: { type: String, default: "" },
    pitch: { type: Number, default: null },
    yaw: { type: Number, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("HotspotDetectorConfig", HotspotDetectorConfigSchema);
