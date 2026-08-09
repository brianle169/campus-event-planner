import { Router } from "express";
import {
  userLogIn,
  userLogOut,
  getCurrentUser,
  userRegister,
} from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/login", userLogIn);
authRoutes.post("/logout", userLogOut);
authRoutes.get("/me", getCurrentUser);
authRoutes.post("/signup", userRegister);

export default authRoutes;
