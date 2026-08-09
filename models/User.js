// This file defines the User model for the Smart Campus Event Planner application.
export const ROLES = ["student", "admin"];

// The user shape that leaves the server. Fields are listed rather than
// deleting password_hash from the row, so a column added to `users` later
// can't leak by default.
export function toPublicUser(row) {
  return {
    user_id: row.user_id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
  };
}

export class User {
  constructor(user_id, full_name, email, password_hash, role, created_at) {
    this.user_id = user_id;
    this.full_name = full_name;
    this.email = email;
    this.password_hash = password_hash;
    this.role = role;
    this.created_at = created_at;
  }
}
