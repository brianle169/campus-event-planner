import { Registration } from "../../../models/Registration.js";
import {
  currentUser,
  registrations,
  getEventById,
  getRegistrationCountForEvent,
} from "../data/sampleData.js";

export const EVENT_STATUS_BADGES = {
  open: { label: "Open", className: "badge-open" },
  full: { label: "Full", className: "badge-full" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
  completed: { label: "Completed", className: "badge-completed" },
  disabled: { label: "Disabled", className: "badge-cancelled" },
};

export const REGISTRATION_STATUS_BADGES = {
  registered: { label: "Registered", className: "badge-open" },
  attended: { label: "Attended", className: "badge-completed" },
  missed: { label: "Missed", className: "badge-cancelled" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
};

export const getMyRegistrationForEvent = (eventId) =>
  registrations.find(
    (r) =>
      r.user_id === currentUser.user_id &&
      r.event_id === eventId &&
      r.status !== "cancelled",
  );

export const isRegisteredByCurrentUser = (eventId) =>
  Boolean(getMyRegistrationForEvent(eventId));

export const isEventFull = (event) =>
  event.status === "full" ||
  getRegistrationCountForEvent(event.event_id) >= event.capacity;

export const registerForEvent = (eventId) => {
  const event = getEventById(eventId);
  const registrationDate = new Date().toISOString().slice(0, 10);
  const registration = new Registration(
    `reg-${Date.now()}`,
    currentUser.user_id,
    eventId,
    registrationDate,
    "registered",
    false,
  );
  registrations.push(registration);

  if (typeof showToast === "function") {
    showToast(`Registered for ${event.title}`, "success");
  }
  return registration;
};

export const cancelRegistration = (registrationId) => {
  const registration = registrations.find(
    (r) => r.registration_id === registrationId,
  );
  if (!registration) return null;

  registration.status = "cancelled";
  if (typeof showToast === "function") {
    showToast("Registration cancelled", "error");
  }
  return registration;
};
