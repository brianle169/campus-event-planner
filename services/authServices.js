// Business rules for authentication: credential checking, sign-up, and the
// role-to-landing-page mapping.

import { getUserByEmail, addUser } from "../db/repositories/userRepository.js";
import { ROLES, toPublicUser } from "../models/User.js";
import { hashPassword, verifyPassword } from "./shared/passwordService.js";
import { httpError } from "./shared/httpError.js";

const EMAIL_TAKEN = "There exists an account associated to this email.";

export function dashboardFor(role) {
  return role === "admin" ? "/admin/dashboard" : "/student/dashboard";
}

export function authenticate(email, password) {
  const user = getUserByEmail(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw httpError("Invalid credentials.", 401);
  }

  return toPublicUser(user);
}

export function addNewUser(full_name, email, password, role) {
  if (!ROLES.includes(role)) throw httpError("Choose an account type.", 400);

  if (getUserByEmail(email)) throw httpError(EMAIL_TAKEN, 409);

  const password_hash = hashPassword(password);

  try {
    return toPublicUser(addUser(full_name, email, password_hash, role));
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE")
      throw httpError(EMAIL_TAKEN, 409);
    throw err;
  }
}
