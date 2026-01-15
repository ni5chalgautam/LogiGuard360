export function notFound(req, res, next){
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next){
  const status = err.statusCode || 500;
  const msg = err.message || "Server error";
  res.status(status).json({ message: msg });
}
