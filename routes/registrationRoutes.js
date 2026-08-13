import { Router } from "express";
import {
    getMyRegistrations,
    createRegistration,
    deleteRegistration,
} from "../controllers/registrationController.js";
import { validationRules, validate } from "../middleware/validate.js";

const registrationRoutes = Router();

registrationRoutes.get("/mine", getMyRegistrations);

registrationRoutes.post(
    "/",
    validate(validationRules.event_id),
    createRegistration,
);

registrationRoutes.delete(
    "/:id",
    validate(validationRules.registrationId),
    deleteRegistration,
);

export default registrationRoutes;