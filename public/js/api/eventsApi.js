import { get } from "./client.js";

export async function fetchEvents() {
  const res = await get("/api/events");
  return res.data?.events || [];
}

export async function getEvent(eventId) {
  const res = await get(`/api/events/${eventId}`);
  return res.data?.event;
}

export async function fetchRegistrations() {
  const res = await get("/api/admin/registrations");
  return res.data || [];
}
