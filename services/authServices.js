import { getUserByEmail } from "../db/repositories/userRepository.js";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";

// Create an HTTP Error object
function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Create an object to send to client
function toUserObject(repoResult) {
  return {
    user_id: repoResult.user_id,
    full_name: repoResult.full_name,
    email: repoResult.email,
    role: repoResult.role,
  };
}

// Where a signed-in user belongs, by role. Shared by the login controller and
// the page guards so the mapping only lives in one place.
export function dashboardFor(role) {
  return role === "admin" ? "/admin/dashboard" : "/student/dashboard";
}

// Authenticate the credentials
export function authenticate(email, password) {
  if (!email || !password) throw httpError("Insufficient data.", 400);

  const user = getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw httpError("Invalid credentials.", 401);
  }

  return toUserObject(user);
}
