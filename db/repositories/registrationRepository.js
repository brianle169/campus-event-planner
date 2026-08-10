import db from "../connection.js";

const findEventRegistrationsCount = db.prepare(
    "SELECT COUNT(*) as count FROM registrations WHERE event_id =? AND status != 'cancelled'",
);

export function eventRegistrationsCount(id) {
    return findEventRegistrationsCount.get(id);
}

const findUserEventRegistration = db.prepare(`
    SELECT registration_id
    FROM registrations
    WHERE user_id = ?
      AND event_id = ?
      AND status != 'cancelled'
`);

export function findActiveRegistration(userId, eventId) {
    return findUserEventRegistration.get(userId, eventId);
}