// Everything behind these guards is per-user, so it must never be cached.
// Without this the browser can serve a gated page from its cache — or restore
// it from the bfcache — after logout, without any request reaching the guard.
// Set before the checks so the 401/403 responses aren't cached either.
function noStore(res) {
  res.set("Cache-Control", "no-store");
}

export function requireAuth(req, res, next) {
  noStore(res);
  if (!req.session.user_id)
    return res.status(401).json({ error: "Sign in is required." });
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    noStore(res);
    if (!req.session.user_id)
      return res.status(401).json({ error: "Sign in is required." });
    if (req.session.role !== role)
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
