import { Router } from "express";
import {
  filterableEvents,
  getEvent,
  createEvent,
  updateEvent,
  changeStatus,
  deleteEvent,
} from "../controllers/eventController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validationRules, validate } from "../middleware/validate.js";

const eventRoutes = Router();

eventRoutes.get("/", filterableEvents);

eventRoutes.get("/:id", validate(validationRules.eventId), getEvent);

eventRoutes.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(
    validationRules.title,
    validationRules.category,
    validationRules.status,
    validationRules.event_date_format,
    validationRules.event_date_not_past,
    validationRules.capacity,
    validationRules.start_time,
    validationRules.end_time,
    validationRules.location,
  ),
  createEvent,
);

eventRoutes.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(
    validationRules.eventId,
    validationRules.title,
    validationRules.category,
    validationRules.status,
    validationRules.event_date_format,
    validationRules.capacity,
    validationRules.start_time,
    validationRules.end_time,
    validationRules.location,
  ),
  updateEvent,
);

eventRoutes.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin"),
  validate(validationRules.eventId, validationRules.status),
  changeStatus,
);

eventRoutes.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(validationRules.eventId),
  deleteEvent,
);

export default eventRoutes;
