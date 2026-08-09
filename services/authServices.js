import { getUserByEmail, addUser } from "../db/repositories/userRepository.js";
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

function normalizeStrings(str) {
  return String(str ?? "")
    .trim()
    .toLowerCase();
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

// Sign-up a new user
export function addNewUser(full_name, email, password, role) {
  if (!full_name || !email || !password || !role)
    throw httpError("Insufficient data.", 400);

  // Check for duplicated email
  if (getUserByEmail(normalizeStrings(email))) {
    throw httpError("There exists an account associated to this email.", 409);
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  // Send to repository
  try {
    return toUserObject(
      addUser(
        normalizeStrings(full_name),
        normalizeStrings(email),
        password_hash,
        role,
      ),
    );
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw httpError("There exists an account associated to this email.", 409);
    }
    throw err;
  }
}
