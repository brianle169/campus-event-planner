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

const findByIdStatement = db.prepare(
    "SELECT * FROM registrations WHERE registration_id = ?",
);

export function findById(id) {
    return findByIdStatement.get(id);
}

const findByUserStatement = db.prepare(`
    SELECT r.registration_id, r.user_id, r.event_id, r.registration_date, r.status, r.attended,
           e.title, e.category, e.event_date, e.start_time, e.end_time, e.location,
           e.status AS event_status
    FROM registrations r
    JOIN events e ON r.event_id = e.event_id
    WHERE r.user_id = ?
    ORDER BY e.event_date DESC, e.start_time DESC
`);

export function findByUser(userId) {
    return findByUserStatement.all(userId);
}

const findEventForRegistration = db.prepare(
    "SELECT event_id, capacity, status, event_date FROM events WHERE event_id = ?",
);

const insertRegistrationStatement = db.prepare(`
    INSERT INTO registrations (user_id, event_id)
    VALUES (?, ?)
`);

export const registerForEvent = db.transaction((userId, eventId) => {
    const event = findEventForRegistration.get(eventId);
    if (!event) return { outcome: "event_not_found" };
    if (event.status !== "open") return { outcome: "not_open" };

    // Same local-date comparison eventService uses for `registrable`.
    if (event.event_date < new Date().toISOString().slice(0, 10)) {
        return { outcome: "past" };
    }

    if (findUserEventRegistration.get(userId, eventId)) {
        return { outcome: "duplicate" };
    }

    const active = findEventRegistrationsCount.get(eventId);
    if (active.count >= event.capacity) return { outcome: "full" };

    const info = insertRegistrationStatement.run(userId, eventId);
    return {
        outcome: "created",
        registration: findByIdStatement.get(info.lastInsertRowid),
    };
});

const cancelStatement = db.prepare(`
    UPDATE registrations
    SET status = 'cancelled'
    WHERE registration_id = ? AND status = 'registered'
`);

export function cancel(id) {
    return cancelStatement.run(id);
}