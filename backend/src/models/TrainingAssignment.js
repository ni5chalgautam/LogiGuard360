import mongoose from "mongoose";

const TrainingAssignmentSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    contentId: { type: String, required: true, index: true },
    progress: { type: Number, default: 0 } // 0..1
  },
  { timestamps: true }
);

TrainingAssignmentSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export default mongoose.model("TrainingAssignment", TrainingAssignmentSchema);
