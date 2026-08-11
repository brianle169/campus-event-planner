import {
    findActiveRegistration,
    findByUser,
    findById,
    registerForEvent,
    cancel,
} from "../db/repositories/registrationRepository.js";
import { httpError } from "./shared/httpError.js";

export function isAlreadyRegistered(userId, eventId) {
    return Boolean(findActiveRegistration(userId, eventId));
}

export function myRegistrations(userId) {
    return findByUser(userId);
}

export function register(userId, eventId) {
    const result = registerForEvent(userId, eventId);

    switch (result.outcome) {
        case "created":
            return result.registration;
        case "event_not_found":
            throw httpError("Event not found.", 404);
        case "not_open":
            throw httpError("This event is not open for registration.", 409);
        case "past":
            throw httpError("This event has already taken place.", 409);
        case "duplicate":
            throw httpError("You are already registered for this event.", 409);
        case "full":
            throw httpError("This event is full.", 409);
        default:
            throw httpError("Registration failed.", 500);
    }
}

export function cancelRegistration(userId, registrationId) {
    const registration = findById(registrationId);

    if (!registration || registration.user_id !== userId) {
        throw httpError("Registration not found.", 404);
    }

    if (registration.status !== "registered") {
        throw httpError(
            registration.status === "cancelled"
                ? "This registration is already cancelled."
                : "This registration can no longer be cancelled.",
            409,
        );
    }

    cancel(registrationId);
}