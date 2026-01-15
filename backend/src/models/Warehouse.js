import mongoose from "mongoose";

const WarehouseSchema = new mongoose.Schema(
  {
    warehouseId: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    location: { type: String, default: "" },
    capacity: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Warehouse", WarehouseSchema);
