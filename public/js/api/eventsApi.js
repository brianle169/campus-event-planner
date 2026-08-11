import { get } from "./client.js";

export async function fetchEvents(filters = {}) {
  const params = new URLSearchParams();

  if (filters.title) {
    params.set("title", filters.title);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.location) {
    params.set("location", filters.location);
  }

  if (filters.organizer_id !== undefined) {
    params.set("organizer_id", filters.organizer_id);
  }

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const query = params.toString();

  const res = await get(`/api/events${query ? `?${query}` : ""}`);

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
