// Session endpoints, mounted at /api/auth (see routes/authRoutes.js).
//
// The session itself is a cookie the server sets and clears, so nothing here
// tracks or returns a token. `redirect` on the success bodies is the server
// deciding where the user belongs next; navigating there is the caller's job.

import { get, post } from "./client.js";

export function signUp({ full_name, email, password, role }) {
  return post("/api/auth/signup", { full_name, email, password, role });
}

export function logIn({ email, password }) {
  return post("/api/auth/login", { email, password });
}

export function logOut() {
  return post("/api/auth/logout");
}

// Answers { user, dashboard }. `user` is null when there is no session, which
// is a 200 rather than a 401 — callers check the field, not the status.
export function fetchCurrentUser() {
  return get("/api/auth/me");
}
