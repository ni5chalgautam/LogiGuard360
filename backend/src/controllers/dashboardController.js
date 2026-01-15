import Warehouse from "../models/Warehouse.js";
import Hotspot from "../models/Hotspot.js";
import TrainingAssignment from "../models/TrainingAssignment.js";

export async function getDashboard(req, res, next){
  try{
    const warehouses = await Warehouse.countDocuments();
    const hotspots = await Hotspot.countDocuments();
    const trainingAssigned = await TrainingAssignment.countDocuments();

    const avg = await TrainingAssignment.aggregate([
      { $group: { _id: null, avgProgress: { $avg: "$progress" } } }
    ]);

    const completionRate = avg.length ? (avg[0].avgProgress || 0) : 0;

    return res.json({ warehouses, hotspots, trainingAssigned, completionRate });
  }catch(err){
    next(err);
  }
}
