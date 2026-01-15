import Report from "../models/Report.js";
import Warehouse from "../models/Warehouse.js";
import Hotspot from "../models/Hotspot.js";
import TrainingAssignment from "../models/TrainingAssignment.js";
import AuditLog from "../models/AuditLog.js";
import { makeId } from "../utils/ids.js";

export async function generateReport(req, res, next){
  try{
    const { type, warehouseId, userId, startDate, endDate } = req.body || {};
    if(!type) return res.status(400).json({ message: "type is required" });

    const sd = startDate ? new Date(startDate) : null;
    const ed = endDate ? new Date(endDate) : null;

    let data = {};
    if(type === "warehouse"){
      const wh = warehouseId ? await Warehouse.findOne({ warehouseId }) : null;
      const filter = { };
      if(wh) filter.warehouseId = wh.warehouseId;
      if(sd || ed){
        filter.createdAt = {};
        if(sd) filter.createdAt.$gte = sd;
        if(ed) filter.createdAt.$lte = ed;
      }
      const hotspots = await Hotspot.find(filter).sort({ createdAt: -1 }).limit(200);
      data = {
        warehouseId: wh?.warehouseId || warehouseId || "",
        hotspotCount: hotspots.length,
        highRisk: hotspots.filter(h => h.riskLevel === "High").length,
        hotspots
      };
    }else if(type === "user"){
      const filter = { };
      if(userId) filter.userId = userId;
      if(sd || ed){
        filter.createdAt = {};
        if(sd) filter.createdAt.$gte = sd;
        if(ed) filter.createdAt.$lte = ed;
      }
      const assignments = await TrainingAssignment.find(filter).sort({ createdAt: -1 }).limit(200);
      const avg = assignments.length ? assignments.reduce((a,b)=>a+(b.progress||0),0)/assignments.length : 0;
      data = { userId: userId || "", assignments, averageProgress: avg };
    }else{
      return res.status(400).json({ message: "type must be 'warehouse' or 'user'" });
    }

    const report = await Report.create({
      reportId: makeId("R"),
      type,
      warehouseId: warehouseId || "",
      userId: userId || "",
      startDate: sd || undefined,
      endDate: ed || undefined,
      data,
      createdBy: req.user?.userId || ""
    });

    await AuditLog.create({
      id: makeId("A"),
      action: "REPORT_GENERATED",
      actor: req.user?.userId || "",
      meta: { reportId: report.reportId, type }
    });

    res.status(201).json({
      reportId: report.reportId,
      type: report.type,
      generationDate: report.generationDate,
      data: report.data
    });
  }catch(err){ next(err); }
}
