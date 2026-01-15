import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    feedbackId: { type: String, unique: true, index: true },
    userId: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", FeedbackSchema);
