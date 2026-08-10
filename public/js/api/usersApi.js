// The signed-in user's own record, mounted at /api/users (see routes/userRoutes.js).
//
// Both paths end in "me" rather than carrying an id, so there is no request a
// user could make here for someone else's profile.

import { patch, put } from "./client.js";

// Answers { user } with the stored record, which the caller re-renders from —
// the server is the authority on what was actually saved.
export function updateMyProfile({ full_name }) {
  return patch("/api/users/me", { full_name });
}

// A wrong current password comes back as a 400 with a `fields` body, the same
// shape as a validation failure, so callers handle both through one branch.
export function changeMyPassword({
  current_password,
  new_password,
  confirm_new_password,
}) {
  return put("/api/users/me/password", {
    current_password,
    new_password,
    confirm_new_password,
  });
}
