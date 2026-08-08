import { dashboardFor } from "../services/authServices.js";

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

// Page equivalent of requireRole. Pages are reached by browser navigation, so
// failures redirect — a raw JSON error rendered as text is a dead end for the
// user. Omit `role` to gate a page for any signed-in user.
export function requirePage(role) {
  return (req, res, next) => {
    noStore(res);
    if (!req.session.user_id) return res.redirect("/login");
    // Signed in but wrong role: send them to their own dashboard. Bouncing
    // them to /login would wrongly suggest their session had expired.
    if (role && req.session.role !== role)
      return res.redirect(dashboardFor(req.session.role));
    next();
  };
}

// The inverse: keep signed-in users off /login and /register, where submitting
// the form would silently replace the session they already have.
export function redirectIfAuthed(req, res, next) {
  noStore(res);
  if (req.session.user_id) return res.redirect(dashboardFor(req.session.role));
  next();
}
