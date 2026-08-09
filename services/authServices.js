import { getUserByEmail, addUser } from "../db/repositories/userRepository.js";
import { ROLES } from "../middleware/validate.js";
import bcrypt from "bcrypt";

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
  const user = getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw httpError("Invalid credentials.", 401);
  }

  return toUserObject(user);
}

// Sign-up a new user
export function addNewUser(full_name, email, password, role) {
  if (!ROLES.includes(role)) throw httpError("Choose an account type.", 400);

  if (getUserByEmail(email)) {
    throw httpError("There exists an account associated to this email.", 409);
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  try {
    return toUserObject(addUser(full_name, email, password_hash, role));
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw httpError("There exists an account associated to this email.", 409);
    }
    throw err;
  }
}
