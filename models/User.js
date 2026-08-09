// This file defines the User model for the Smart Campus Event Planner application.
export const ROLES = ["student", "admin"];

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
