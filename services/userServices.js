// Business rules for a signed-in user managing their own account. Every
// function takes the id from the session.

import {
  getUserById,
  updateFullName,
  updatePasswordHash,
} from "../db/repositories/userRepository.js";
import { toPublicUser } from "../models/User.js";
import { hashPassword, verifyPassword } from "./shared/passwordService.js";
import { httpError } from "./shared/httpError.js";

// The session outlived the row it points at. 401 rather than 404 so the client
// sends them back to sign in instead of showing a broken profile.
const GONE = () => httpError("Please sign in again.", 401);

export function updateProfile(userId, full_name) {
  const updated = updateFullName(userId, full_name);
  if (!updated) throw GONE();

  return toPublicUser(updated);
}

export function changePassword(userId, currentPassword, newPassword) {
  const user = getUserById(userId);
  if (!user) throw GONE();

  // Being signed in isn't enough: an unattended session shouldn't be able to
  // lock out the owner.
  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw httpError("Invalid inputs.", 400, {
      current_password: "Current password is incorrect.",
    });
  }

  if (verifyPassword(newPassword, user.password_hash)) {
    throw httpError("Invalid inputs.", 400, {
      new_password: "New password must be different from your current one.",
    });
  }

  if (!updatePasswordHash(userId, hashPassword(newPassword))) throw GONE();
}
