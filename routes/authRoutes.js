import { Router } from "express";
import {
  userLogIn,
  userLogOut,
  getCurrentUser,
  userRegister,
} from "../controllers/authController.js";
import { validateBody, check } from "../middleware/validate.js";

const authRoutes = Router();

authRoutes.post(
  "/login",
  validateBody({ email: check.email, password: check.signInPassword }),
  userLogIn,
);
authRoutes.post("/logout", userLogOut);
authRoutes.get("/me", getCurrentUser);
authRoutes.post(
  "/signup",
  validateBody({
    full_name: check.full_name,
    email: check.email,
    password: check.password,
    role: check.role,
  }),
  userRegister,
);

export default authRoutes;
