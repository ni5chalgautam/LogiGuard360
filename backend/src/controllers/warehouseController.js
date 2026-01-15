import Warehouse from "../models/Warehouse.js";
import Hotspot from "../models/Hotspot.js";

export async function listWarehouses(req, res, next){
  try{
    const items = await Warehouse.find().sort({ createdAt: -1 });
    res.json(items);
  }catch(err){ next(err); }
}

export async function listHotspots(req, res, next){
  try{
    const id = req.params.id;
    // id can be warehouseId or mongo _id. Try both.
    let warehouseId = id;
    const wh = await Warehouse.findOne({ warehouseId: id });
    if(!wh && id.match(/^[0-9a-fA-F]{24}$/)){
      const byId = await Warehouse.findById(id);
      if(byId) warehouseId = byId.warehouseId;
    }else if(wh){
      warehouseId = wh.warehouseId;
    }

    const items = await Hotspot.find({ warehouseId }).sort({ createdAt: -1 });
    res.json(items);
  }catch(err){ next(err); }
}

export async function getStatus(req, res, next){
  try{
    const id = req.params.id;
    let warehouseId = id;
    const wh = await Warehouse.findOne({ warehouseId: id });
    if(wh) warehouseId = wh.warehouseId;

    const hotspotCount = await Hotspot.countDocuments({ warehouseId });
    res.json({ warehouseId, hotspotCount, status: hotspotCount ? "Attention needed" : "Normal" });
  }catch(err){ next(err); }
}
