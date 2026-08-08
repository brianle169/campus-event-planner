export function requireAuth(req, res, next) {
  if (!req.session.user_id)
    return res.status(401).json({ error: "Sign in is required." });
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user_id)
      return res.status(401).json({ error: "Sign in is required." });
    if (req.session.role !== role)
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
