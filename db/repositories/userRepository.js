// User repository will be responsible for communicating with the database including read and write.
// Results from repository will then bubble back up to the service layer, and controller layer.

import db from "../connection.js";

// Get
export function getUserByEmail(email) {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  return row;
}

export function getUserById(userId) {
  const row = db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId);
  return row;
}

// Insert
export function addUser(full_name, email, password_hash, role) {
  return db
    .prepare(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)
      RETURNING user_id, full_name, email, role, created_at`,
    )
    .get(full_name, email, password_hash, role);
}

// Update
export function updateFullName(userId, full_name) {
  return db
    .prepare(
      `UPDATE users SET full_name = ? WHERE user_id = ?
      RETURNING user_id, full_name, email, role, created_at`,
    )
    .get(full_name, userId);
}

export function updatePasswordHash(userId, password_hash) {
  return db
    .prepare("UPDATE users SET password_hash = ? WHERE user_id = ?")
    .run(password_hash, userId).changes;
}
