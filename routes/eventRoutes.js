import { Router } from "express";
import { filterableEvents, getEvent, createEvent, updateEvent, changeStatus, deleteEvent } from "../controllers/eventController.js";

const eventRoutes = Router();

eventRoutes.get("/", filterableEvents); // returns all events

eventRoutes.get("/:id", getEvent);

eventRoutes.post("/", createEvent);

eventRoutes.put("/:id", updateEvent);

eventRoutes.patch("/:id/status", changeStatus);

eventRoutes.delete("/:id", deleteEvent)

export default eventRoutes;
