import { Router } from "express";
import { filterableEvents, getEvent, createEvent, updateEvent, changeStatus, deleteEvent } from "../controllers/eventController.js";
import { requireAuth, requireRole } from "../middleware/auth.js"

const eventRoutes = Router();

eventRoutes.get("/", filterableEvents);

eventRoutes.get("/:id", getEvent);

eventRoutes.post("/", requireAuth, requireRole("admin"), createEvent);

eventRoutes.put("/:id", requireAuth, requireRole("admin"), updateEvent);

eventRoutes.patch("/:id/status", requireAuth, requireRole("admin"), changeStatus);

eventRoutes.delete("/:id", requireAuth, requireRole("admin"), deleteEvent)

export default eventRoutes;
