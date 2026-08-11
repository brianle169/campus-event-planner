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

const findRegistrationsByEventIdStatement = db.prepare(`
    SELECT r.registration_id, r.user_id, r.event_id, r.registration_date, r.status, r.attended,
           u.full_name, u.email
    FROM registrations r
    JOIN users u ON r.user_id = u.user_id
    WHERE r.event_id = ?
`);

export function findRegistrationsByEventId(eventId) {
    return findRegistrationsByEventIdStatement.all(eventId);
}

const updateAttendanceStatement = db.prepare(`
    UPDATE registrations
    SET status = ?, attended = ?
    WHERE registration_id = ?
`);

export function updateAttendanceStatus(registrationId, status, attended) {
    return updateAttendanceStatement.run(status, attended, registrationId);
}

const findAllRegistrationsStatement = db.prepare(`
    SELECT r.registration_id, r.user_id, r.event_id, r.registration_date, r.status, r.attended,
           u.full_name, u.email
    FROM registrations r
    JOIN users u ON r.user_id = u.user_id
`);

export function findAllRegistrations() {
    return findAllRegistrationsStatement.all();
}