import mongoose from "mongoose";

const TrainingContentSchema = new mongoose.Schema(
  {
    contentId: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    type: { type: String, default: "micro" }, // micro | scenario | etc.
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("TrainingContent", TrainingContentSchema);
