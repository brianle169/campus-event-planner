import { Router } from "express";
import { userLogIn } from "../controllers/authController.js";
import errorHandler from "../middleware/errorHandler.js";

const authRoutes = Router({ mergeParams: true });

authRoutes.post("/login", userLogIn, errorHandler);

export default authRoutes;
