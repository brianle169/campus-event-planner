import { findActiveRegistration } from "../db/repositories/registrationRepository.js";

export function isAlreadyRegistered(userId, eventId) {
    return Boolean(findActiveRegistration(userId, eventId));
}