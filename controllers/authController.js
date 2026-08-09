import { authenticate, dashboardFor } from "../services/authServices.js";
import { getUserById } from "../db/repositories/userRepository.js";

export function userLogIn(req, res, next) {
  // Get the email and password from body
  if (!req.body) next(new Error("Request body is empty."));

  const { email, password } = req.body;
  const user = authenticate(email, password);

  // Create a session
  req.session.regenerate((err) => {
    if (err) return next(err);

    req.session.user_id = user.user_id;
    req.session.role = user.role;
  });

  req.session.save((err) => {
    if (err) return next(err);
    res.json({ user, redirect: dashboardFor(user.role) });
  });
}

export function getCurrentUser(req, res) {
  res.set("Cache-Control", "no-store");

  if (!req.session.user_id) return res.json({ user: null });

  const row = getUserById(req.session.user_id);
  if (!row) return res.json({ user: null });

  const { password_hash, ...user } = row;
  res.json({ user, dashboard: dashboardFor(user.role) });
}

export function userLogOut(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.json({ redirect: "/" });
  });
}
