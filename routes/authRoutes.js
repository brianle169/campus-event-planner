import { Router } from "express";
import { userLogIn } from "../controllers/authController.js";

const authRoutes = Router({ mergeParams: true });

authRoutes.post("/login", userLogIn);

export default authRoutes;
