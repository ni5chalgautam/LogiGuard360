import Warehouse from "../models/Warehouse.js";
import Hotspot from "../models/Hotspot.js";
import TrainingContent from "../models/TrainingContent.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { makeId } from "../utils/ids.js";

export async function seedIfEmpty(){
  // ---------- Warehouses ----------
  const whCount = await Warehouse.countDocuments();
  if(whCount === 0){
    await Warehouse.create({
      warehouseId: "WH-001",
      name: "Main Warehouse",
      location: "Dock A",
      capacity: 250
    });
  }

  // ---------- Training Content ----------
  const tcCount = await TrainingContent.countDocuments();
  if(tcCount === 0){
    await TrainingContent.insertMany([
      { contentId: "TC-001", title: "Phishing basics", type: "micro", description: "Recognise phishing indicators and report safely." },
      { contentId: "TC-002", title: "USB safety", type: "micro", description: "How to handle unknown USB devices at work." },
      { contentId: "TC-003", title: "Secure terminals", type: "scenario", description: "Lock screens, avoid shoulder surfing, protect credentials." }
    ]);
  }

  // ---------- Hotspots (FIXED: ensure WH-001 has 6 hotspots) ----------
  const desiredHotspots = [
    {
      hotspotId: "HS-CCTV",
      warehouseId: "WH-001",
      zone: "Hacked CCTV",
      riskLevel: "High",
      description: "CCTV/IoT devices with default passwords or exposed ports can be hijacked. Use strong credentials, isolate IoT VLAN, disable defaults.",
      pitch: 35.7461,
      yaw: -70.5341
    },
    {
      hotspotId: "HS-PHISH",
      warehouseId: "WH-001",
      zone: "Phishing Emails",
      riskLevel: "High",
      description: "Phishing emails trick staff into clicking malicious links or sharing credentials. Verify sender, don’t click unknown links, report suspicious messages.",
      pitch: 7.1026,
      yaw: -123.4834
    },
    {
      hotspotId: "HS-WIFI",
      warehouseId: "WH-001",
      zone: "Unsecured Wi-Fi",
      riskLevel: "Medium",
      description: "Open/weak Wi-Fi can be used for interception and unauthorized access. Use WPA2/WPA3, strong passphrase, separate guest network.",
      pitch: -13.1815,
      yaw: -94.3572
    },
    {
      hotspotId: "HS-DATA",
      warehouseId: "WH-001",
      zone: "Data Theft",
      riskLevel: "High",
      description: "Sensitive warehouse/shipping data can be stolen via weak access control. Use least privilege, encryption, and audit logs.",
      pitch: 7.8460,
      yaw: 29.0499
    },
    {
      hotspotId: "HS-NET",
      warehouseId: "WH-001",
      zone: "Network Breach",
      riskLevel: "High",
      description: "Weak segmentation/patching can allow a breach to spread. Patch systems, segment network, monitor logs, enforce MFA.",
      pitch: -11.3318,
      yaw: 76.4754
    },
    {
      hotspotId: "HS-SCAN",
      warehouseId: "WH-001",
      zone: "Vulnerable Scanner",
      riskLevel: "Medium",
      description: "Old scanners/terminals may have outdated firmware and insecure configs. Update firmware, disable unused services, enforce device auth.",
      pitch: -33.3150,
      yaw: 64.3777
    }
  ];

  // Ensure WH-001 has all desired hotspots (top-up missing ones)
  const existing = await Hotspot.find({ warehouseId: "WH-001" }).select("hotspotId");
  const existingIds = new Set(existing.map(h => h.hotspotId));

  const missing = desiredHotspots.filter(h => !existingIds.has(h.hotspotId));
  if(missing.length > 0){
    await Hotspot.insertMany(missing);
  }

  // ---------- Users ----------
  const userCount = await User.countDocuments();
  if(userCount === 0){
    const hash = await bcrypt.hash("Password123!", 10);

    await User.create({
      userId: "U-ADMIN",
      username: "Admin",
      email: "admin@logiguard360.local",
      passwordHash: hash,
      role: "systemAdministrator"
    });

    await User.create({
      userId: "U-MANAGER",
      username: "Manager",
      email: "manager@logiguard360.local",
      passwordHash: hash,
      role: "warehouseManager"
    });

    await User.create({
      userId: "U-STAFF",
      username: "Staff",
      email: "staff@logiguard360.local",
      passwordHash: hash,
      role: "logisticsStaff"
    });
  }
}