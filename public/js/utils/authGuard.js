import { fetchCurrentUser } from "../api/authApi.js";

export async function requireAuth({
  redirectTo = "/login",
  allowedRoles = null,
} = {}) {
  try {
    const { ok, status, data } = await fetchCurrentUser();
    const user = data?.user ?? null;

    if (!ok || status === 401 || !user) {
      window.location.href = redirectTo;
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = redirectTo;
      return null;
    }

    return user;
  } catch (error) {
    console.error("Auth guard failed", error);
    window.location.href = redirectTo;
    return null;
  }
}
