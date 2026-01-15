import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, unique: true, index: true },
    type: { type: String, enum: ["warehouse","user"], required: true },
    generationDate: { type: Date, default: Date.now },
    warehouseId: { type: String, default: "" },
    userId: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    data: { type: Object, default: {} },
    createdBy: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Report", ReportSchema);
