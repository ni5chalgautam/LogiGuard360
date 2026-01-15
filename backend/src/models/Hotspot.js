import mongoose from "mongoose";

const HotspotSchema = new mongoose.Schema(
  {
    hotspotId: { type: String, unique: true, index: true },
    warehouseId: { type: String, required: true, index: true },
    zone: { type: String, required: true },
    riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    description: { type: String, default: "" },

    //  for 360 positioning
    pitch: { type: Number, default: null },
    yaw: { type: Number, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Hotspot", HotspotSchema);
