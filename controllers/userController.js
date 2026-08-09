import { updateProfile, changePassword } from "../services/userServices.js";

export function updateMyProfile(req, res) {
  const { full_name } = req.body;
  const user = updateProfile(req.session.user_id, full_name);

  res.json({ user });
}

export function changeMyPassword(req, res, next) {
  const { current_password, new_password } = req.body;
  changePassword(req.session.user_id, current_password, new_password);

  // drops the current session data, and create a new one.
  const { user_id, role } = req.session;
  req.session.regenerate((err) => {
    if (err) return next(err);

    req.session.user_id = user_id;
    req.session.role = role;

    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr);
      res.json({ ok: true });
    });
  });
}
