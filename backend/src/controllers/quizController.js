import QuizAttempt from "../models/QuizAttempt.js";
import { makeId } from "../utils/ids.js";

// POST /api/quiz/submit  (auth required)
export async function submitQuiz(req, res, next){
  try{
    const { hotspotKey, hotspotName, warehouseId, correct, total } = req.body || {};
    if(!hotspotKey) return res.status(400).json({ message: "hotspotKey is required" });

    const c = Math.max(0, Number(correct || 0));
    const t = Math.max(1, Number(total || 1));
    const pct = Math.round((c / t) * 100);

    const attempt = await QuizAttempt.create({
      attemptId: makeId("QA"),
      userId: req.user?.userId,
      email: req.user?.email || "",
      warehouseId: warehouseId || "WH-001",
      hotspotKey: String(hotspotKey),
      hotspotName: String(hotspotName || ""),
      correct: c,
      total: t,
      percent: pct
    });

    return res.status(201).json({ message: "Saved", attemptId: attempt.attemptId });
  }catch(err){ next(err); }
}

// GET /api/reports/quiz?userId=U-001&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function quizReport(req, res, next){
  try{
    const requestedUserId = String(req.query.userId || "").trim();

    // logisticsStaff can only see their own report
    const isAdminOrMgr = ["systemAdministrator","warehouseManager"].includes(req.user?.role);
    const userId = (isAdminOrMgr && requestedUserId) ? requestedUserId : req.user?.userId;

    const q = { userId };

    // optional date filter
    const { startDate, endDate } = req.query || {};
    if(startDate || endDate){
      q.createdAt = {};
      if(startDate) q.createdAt.$gte = new Date(String(startDate) + "T00:00:00.000Z");
      if(endDate) q.createdAt.$lte = new Date(String(endDate) + "T23:59:59.999Z");
    }

    const attempts = await QuizAttempt.find(q).sort({ createdAt: -1 }).limit(500);

    const totalCorrect = attempts.reduce((s,a)=> s + (a.correct||0), 0);
    const totalQuestions = attempts.reduce((s,a)=> s + (a.total||0), 0);
    const quizzesPlayed = attempts.length;
    const overallPercent = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // breakdown by hotspot
    const map = new Map();
    for(const a of attempts){
      const key = a.hotspotKey || "unknown";
      const item = map.get(key) || { hotspotKey: key, hotspotName: a.hotspotName || key, played: 0, sumPct: 0 };
      item.played += 1;
      item.sumPct += Number(a.percent || 0);
      map.set(key, item);
    }
    const byHotspot = Array.from(map.values())
      .map(x => ({ ...x, avgPercent: x.played ? Math.round(x.sumPct / x.played) : 0 }))
      .sort((a,b)=> b.played - a.played);

    const recent = attempts.slice(0, 10).map(a => ({
      attemptId: a.attemptId,
      hotspotKey: a.hotspotKey,
      hotspotName: a.hotspotName,
      percent: a.percent,
      correct: a.correct,
      total: a.total,
      at: a.createdAt
    }));

    return res.json({
      userId,
      quizzesPlayed,
      totalCorrect,
      totalQuestions,
      overallPercent,
      byHotspot,
      recent
    });
  }catch(err){ next(err); }
}
