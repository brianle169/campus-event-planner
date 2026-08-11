import { Router } from "express";
import * as adminController from "../controllers/adminController.js";

const adminRoutes = Router();

adminRoutes.get("/registrations", adminController.getAllRegistrations);
adminRoutes.get("/events/:id/registrations", adminController.getEventRoster);
adminRoutes.patch("/events/:id/registrations/:regId/attendance", adminController.updateAttendance);
adminRoutes.get("/stats/student", adminController.getStudentStats);
adminRoutes.get("/stats/admin", adminController.getAdminStats);

export default adminRoutes;
