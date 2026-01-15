import TrainingContent from "../models/TrainingContent.js";
import TrainingAssignment from "../models/TrainingAssignment.js";
import AuditLog from "../models/AuditLog.js";
import { makeId } from "../utils/ids.js";

export async function listContent(req, res, next){
  try{
    const items = await TrainingContent.find().sort({ createdAt: -1 });
    res.json(items);
  }catch(err){ next(err); }
}

export async function assignTraining(req, res, next){
  try{
    const { userId, contentId } = req.body || {};
    if(!userId || !contentId) return res.status(400).json({ message: "userId and contentId are required" });

    const assignment = await TrainingAssignment.findOneAndUpdate(
      { userId, contentId },
      { $setOnInsert: { assignmentId: makeId("TA"), progress: 0 } },
      { new: true, upsert: true }
    );

    await AuditLog.create({
      id: makeId("A"),
      action: "ASSIGN_TRAINING",
      actor: req.user?.userId || "",
      meta: { userId, contentId }
    });

    res.status(201).json({ assignmentId: assignment.assignmentId, userId, contentId, progress: assignment.progress });
  }catch(err){ next(err); }
}

export async function getProgress(req, res, next){
  try{
    const { userId, contentId } = req.query || {};
    if(!userId || !contentId) return res.status(400).json({ message: "userId and contentId are required" });

    const assignment = await TrainingAssignment.findOne({ userId: String(userId), contentId: String(contentId) });
    const progress = assignment ? assignment.progress : 0;
    res.json({ progress });
  }catch(err){ next(err); }
}
