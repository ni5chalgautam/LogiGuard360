import Warehouse from "../models/Warehouse.js";
import AuditLog from "../models/AuditLog.js";
import { makeId } from "../utils/ids.js";

export async function configureWarehouse(req, res, next){
  try{
    const { warehouseId, name, location, capacity } = req.body || {};
    if(!warehouseId || !name) return res.status(400).json({ message: "warehouseId and name are required" });

    const updated = await Warehouse.findOneAndUpdate(
      { warehouseId: String(warehouseId).trim() },
      { warehouseId: String(warehouseId).trim(), name: String(name).trim(), location: String(location || ""), capacity: Number(capacity || 0) },
      { new: true, upsert: true }
    );

    await AuditLog.create({
      id: makeId("A"),
      action: "WAREHOUSE_CONFIGURE",
      actor: req.user?.userId || "",
      meta: { warehouseId: updated.warehouseId }
    });

    res.json(updated);
  }catch(err){ next(err); }
}
