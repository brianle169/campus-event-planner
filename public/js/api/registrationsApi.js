import { get, post, del } from "./client.js";

export async function fetchMyRegistrations() {
  const res = await get("/api/registrations/mine");
  return res.data?.registrations || [];
}

export async function registerForEvent(eventId) {
  return post("/api/registrations", { event_id: Number(eventId) });
}

export async function cancelRegistration(registrationId) {
  return del(`/api/registrations/${registrationId}`);
}
