import { authenticate } from "../services/authServices.js";

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
    res.json({
      user,
      redirect:
        user.role === "student" ? "/student/dashboard" : "/admin/dashboard",
    });
  });
}
