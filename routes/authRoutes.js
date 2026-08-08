import { Router } from "express";
import { userLogIn, userLogOut } from "../controllers/authController.js";
import errorHandler from "../middleware/errorHandler.js";

const authRoutes = Router({ mergeParams: true });

authRoutes.post("/login", userLogIn);
authRoutes.post("/logout", userLogOut);
// authRoutes.post("/signup", ...);

export default authRoutes;
