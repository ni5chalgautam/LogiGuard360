import Feedback from "../models/Feedback.js";
import AuditLog from "../models/AuditLog.js";
import { makeId } from "../utils/ids.js";

export async function createFeedback(req, res, next){
  try{
    const { userId, message, timestamp } = req.body || {};
    if(!userId || !message) return res.status(400).json({ message: "userId and message are required" });

    const fb = await Feedback.create({
      feedbackId: makeId("FB"),
      userId: String(userId),
      message: String(message),
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await AuditLog.create({
      id: makeId("A"),
      action: "FEEDBACK_CREATED",
      actor: req.user?.userId || "",
      meta: { feedbackId: fb.feedbackId }
    });

    res.status(201).json({ feedbackId: fb.feedbackId });
  }catch(err){ next(err); }
}
