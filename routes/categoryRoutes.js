import { Router } from "express";
import { listCategories } from "../controllers/categoryController.js";

const categoryRoutes = Router();

categoryRoutes.get("/", listCategories);

export default categoryRoutes;
