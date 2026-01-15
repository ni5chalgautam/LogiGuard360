import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { makeId } from "../utils/ids.js";

export async function listUsers(req, res, next){
  try{
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(u => u.toSafeJSON()));
  }catch(err){ next(err); }
}

export async function disableUser(req, res, next){
  try{
    const { userId } = req.body || {};
    if(!userId) return res.status(400).json({ message: "userId is required" });

    const q = String(userId);
    let user = await User.findOne({ userId: q });
    if(!user && q.match(/^[0-9a-fA-F]{24}$/)){
      user = await User.findById(q);
    }
    if(!user) return res.status(404).json({ message: "User not found" });

    user.isActive = false;
    await user.save();

    await AuditLog.create({
      id: makeId("A"),
      action: "USER_DISABLED",
      actor: req.user?.userId || "",
      meta: { target: user.userId }
    });

    res.json({ message: "User disabled", userId: user.userId });
  }catch(err){ next(err); }
}
export async function enableUser(req, res, next){
  try{
    const { userId } = req.body || {};
    if(!userId) return res.status(400).json({ message: "userId is required" });

    const q = String(userId).trim();

    // find by userId or by _id
    let user = await User.findOne({ userId: q });
    if(!user && q.match(/^[0-9a-fA-F]{24}$/)){
      user = await User.findById(q);
    }
    if(!user) return res.status(404).json({ message: "User not found" });

    user.isActive = true;
    await user.save();

    await AuditLog.create({
      id: makeId("A"),
      action: "USER_ENABLED",
      actor: req.user?.userId || "",
      meta: { target: user.userId }
    });

    res.json({ message: "User enabled", userId: user.userId });
  }catch(err){ next(err); }
}


export async function audit(req, res, next){
  try{
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(200);
    res.json(logs.map(l => ({ id: l.id, timestamp: l.timestamp, action: l.action, actor: l.actor })));
  }catch(err){ next(err); }
}
