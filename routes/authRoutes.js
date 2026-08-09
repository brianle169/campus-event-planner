import { Router } from "express";
import {
  userLogIn,
  userLogOut,
  getCurrentUser,
} from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/login", userLogIn);
authRoutes.post("/logout", userLogOut);
authRoutes.get("/me", getCurrentUser);
// authRoutes.post("/signup", ...);

export default authRoutes;
