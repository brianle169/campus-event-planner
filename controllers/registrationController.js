import {
    myRegistrations,
    register,
    cancelRegistration,
} from "../services/registrationService.js";

export function getMyRegistrations(req, res) {
    const registrations = myRegistrations(req.session.user_id);
    res.status(200).json({ registrations });
}

export function createRegistration(req, res) {
    const eventId = Number(req.body.event_id);
    const registration = register(req.session.user_id, eventId);
    res.status(201).json({ registration });
}

export function deleteRegistration(req, res) {
    const registrationId = Number(req.params.id);
    cancelRegistration(req.session.user_id, registrationId);
    res.status(204).send();
}