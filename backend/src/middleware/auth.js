import jwt from "jsonwebtoken";

export function requireAuth(req, res, next){
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if(!token) return res.status(401).json({ message: "Missing token" });

  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, role, email, username }
    return next();
  }catch(err){
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

export function requireRole(roles){
  return (req, res, next) => {
    const r = req.user?.role;
    if(!r || !roles.includes(r)){
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}
