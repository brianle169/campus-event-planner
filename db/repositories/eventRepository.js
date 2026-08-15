import db from "../connection.js";

// Only pull the organizer's name out of users, never the whole row — this
// query backs a public endpoint and users also holds password_hash.
const findByIdStatement = db.prepare(`
    SELECT e.*, u.full_name AS organizer_name
    FROM events e
    JOIN users u ON u.user_id = e.organizer_id
    WHERE e.event_id = ?
`);

export function findById(id) {
  return findByIdStatement.get(id);
}

export function findAll(filters = {}) {
  let query = `
        SELECT e.*, u.full_name AS organizer_name
        FROM events e
        JOIN users u ON u.user_id = e.organizer_id
        WHERE 1 = 1
    `;
  const values = [];

  if (filters.title) {
    query += " AND title LIKE ?";
    values.push(`%${filters.title}%`);
  }

  if (filters.category) {
    query += " AND category = ?";
    values.push(filters.category);
  }

  if (filters.status) {
    query += " AND status = ?";
    values.push(filters.status);
  }

  if (filters.location) {
    query += " AND location = ?";
    values.push(filters.location);
  }

  if (filters.organizer_id !== undefined) {
    query += " AND organizer_id = ?";
    values.push(filters.organizer_id);
  }

  if (filters.startDate) {
    query += " AND event_date >= ?";
    values.push(filters.startDate);
  }

  if (filters.endDate) {
    query += " AND event_date <= ?";
    values.push(filters.endDate);
  }

  return db.prepare(query).all(...values);
}

const insertEventStatement = db.prepare(`
    INSERT INTO events (
        title,
        description,
        category,
        event_date,
        start_time,
        end_time,
        location,
        status,
        capacity,
        organizer_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export function createEvent(event) {
  return insertEventStatement.run(
    event.title,
    event.description,
    event.category,
    event.event_date,
    event.start_time,
    event.end_time,
    event.location,
    event.status,
    event.capacity,
    event.organizer_id,
  );
}

export function update(id, data) {
  let updates = [];
  let values = [];

  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }

  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description);
  }

  if (data.category !== undefined) {
    updates.push("category = ?");
    values.push(data.category);
  }

  if (data.event_date !== undefined) {
    updates.push("event_date = ?");
    values.push(data.event_date);
  }

  if (data.start_time !== undefined) {
    updates.push("start_time = ?");
    values.push(data.start_time);
  }

  if (data.end_time !== undefined) {
    updates.push("end_time = ?");
    values.push(data.end_time);
  }

  if (data.location !== undefined) {
    updates.push("location = ?");
    values.push(data.location);
  }

  if (data.capacity !== undefined) {
    updates.push("capacity = ?");
    values.push(data.capacity);
  }

  if (data.status !== undefined) {
    updates.push("status = ?");
    values.push(data.status);
  }

  if (updates.length === 0) {
    return null;
  }

  const query = `UPDATE events SET ${updates.join(", ")} WHERE event_id = ?`;

  values.push(id);

  const updateStatement = db.prepare(query);
  return updateStatement.run(...values);
}

const setStatusStatement = db.prepare(
  "UPDATE events SET status = ? WHERE event_id = ?",
);

export function setStatus(id, status) {
  return setStatusStatement.run(status, id);
}

const countActiveRegistrationsStatement = db.prepare(
  "SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != 'cancelled'",
);

const deleteRegistrationsForEventStatement = db.prepare(
  "DELETE FROM registrations WHERE event_id = ?",
);

const removeIdStatement = db.prepare("DELETE FROM events WHERE event_id = ?");

export const removeEvent = db.transaction((id) => {
  const active = countActiveRegistrationsStatement.get(id).count;
  if (active > 0) {
    return { outcome: "blocked", activeCount: active };
  }

  deleteRegistrationsForEventStatement.run(id);
  const result = removeIdStatement.run(id);

  return { outcome: result.changes > 0 ? "deleted" : "not_found" };
});
