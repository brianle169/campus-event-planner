// Business rules for authentication: credential checking, sign-up, and the
// role-to-landing-page mapping.

import bcrypt from "bcrypt";
import { getUserByEmail, addUser } from "../db/repositories/userRepository.js";
import { ROLES } from "../models/User.js";

const SALT_ROUNDS = 10;
const EMAIL_TAKEN = "There exists an account associated to this email.";

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toPublicUser(row) {
  return {
    user_id: row.user_id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
  };
}

export function dashboardFor(role) {
  return role === "admin" ? "/admin/dashboard" : "/student/dashboard";
}

export function authenticate(email, password) {
  const user = getUserByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw httpError("Invalid credentials.", 401);
  }

  return toPublicUser(user);
}

export function addNewUser(full_name, email, password, role) {
  if (!ROLES.includes(role)) throw httpError("Choose an account type.", 400);

  if (getUserByEmail(email)) throw httpError(EMAIL_TAKEN, 409);

  const password_hash = bcrypt.hashSync(password, SALT_ROUNDS);

  try {
    return toPublicUser(addUser(full_name, email, password_hash, role));
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE")
      throw httpError(EMAIL_TAKEN, 409);
    throw err;
  }
}
