import { Router } from "express";
import {
  userLogIn,
  userLogOut,
  getCurrentUser,
  userRegister,
} from "../controllers/authController.js";
import { validate, validationRules } from "../middleware/validate.js";

const authRoutes = Router();

authRoutes.post(
  "/login",
  validate(validationRules.full_name, validationRules.signInPassword),
  userLogIn,
);
authRoutes.post("/logout", userLogOut);
authRoutes.get("/me", getCurrentUser);
authRoutes.post(
  "/signup",
  validate(
    validationRules.full_name,
    validationRules.email,
    validationRules.password,
    validationRules.role,
  ),
  userRegister,
);

export default authRoutes;
