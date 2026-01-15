import HotspotDetectorConfig from "../models/HotspotDetectorConfig.js";
import Hotspot from "../models/Hotspot.js";
import Warehouse from "../models/Warehouse.js";
import AuditLog from "../models/AuditLog.js";
import { makeId } from "../utils/ids.js";

function inferRisk(payload, threshold){
  const t = String(payload?.type || "").toLowerCase();
  const status = String(payload?.status || "").toLowerCase();
  const score = Number(payload?.score ?? (t.includes("usb") ? 0.9 : t.includes("phish") ? 0.95 : 0.6));
  const risk = score >= threshold ? "High" : score >= 0.5 ? "Medium" : "Low";
  const zone = payload?.zone || "Unknown";
  const description = payload?.description || `Detected ${t || "event"} (${status || "unknown"})`;
  return { score, riskLevel: risk, zone, description };
}

export async function detect(req, res, next){
  try{
    const payload = req.body || {};
    const cfg = await HotspotDetectorConfig.findOne().sort({ createdAt: -1 });
    const threshold = cfg?.threshold ?? 0.7;

    const { score, riskLevel, zone, description } = inferRisk(payload, threshold);

    // Choose warehouse: if payload includes warehouseId use it; otherwise use first warehouse or WH-001.
    let warehouseId = payload.warehouseId || "WH-001";
    const wh = await Warehouse.findOne({ warehouseId });
    if(!wh){
      const any = await Warehouse.findOne();
      if(any) warehouseId = any.warehouseId;
    }

    let createdHotspot = null;
    if(riskLevel === "High"){
      createdHotspot = await Hotspot.create({
        hotspotId: makeId("HS"),
        warehouseId,
        zone: String(zone),
        riskLevel,
        description: String(description)
      });
    }

    await AuditLog.create({
      id: makeId("A"),
      action: "HOTSPOT_DETECT",
      actor: req.user?.userId || "",
      meta: { riskLevel, score, warehouseId }
    });

    res.json({
      detected: true,
      riskLevel,
      score,
      warehouseId,
      zone,
      description,
      createdHotspotId: createdHotspot?.hotspotId || null
    });
  }catch(err){ next(err); }
}

export async function calibrate(req, res, next){
  try{
    const { threshold, notes } = req.body || {};
    const t = threshold != null ? Number(threshold) : 0.7;
    const cfg = await HotspotDetectorConfig.findOneAndUpdate(
      {},
      { $set: { threshold: isNaN(t) ? 0.7 : t, notes: String(notes || "") }, $setOnInsert: { configId: makeId("CFG") } },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      id: makeId("A"),
      action: "HOTSPOT_CALIBRATE",
      actor: req.user?.userId || "",
      meta: { threshold: cfg.threshold }
    });

    res.json({ configId: cfg.configId, threshold: cfg.threshold, notes: cfg.notes });
  }catch(err){ next(err); }
}
