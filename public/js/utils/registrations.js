import { fetchCurrentUser } from "../api/authApi.js";
import { fetchMyRegistrations, registerForEvent as registerForApiEvent, cancelRegistration as cancelApiRegistration } from "../api/registrationsApi.js";

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

export const getMyRegistrationForEvent = async (eventId) => {
  const registrations = await fetchMyRegistrations();
  return registrations.find(
    (r) => Number(r.event_id) === Number(eventId) && r.status !== "cancelled",
  );
};

export const isRegisteredByCurrentUser = async (eventId) =>
  Boolean(await getMyRegistrationForEvent(eventId));

export const isEventFull = (event) =>
  event.runTimeStatus === "full" || Number(event.registrationCount || 0) >= Number(event.capacity || 0);

export const registerForEvent = async (eventId) => {
  const currentUser = await fetchCurrentUser();
  if (!currentUser || !currentUser.data?.user) return null;

  const response = await registerForApiEvent(eventId);
  if (response.ok && typeof showToast === "function") {
    showToast("Registered successfully", "success");
  }
  return response;
};

export const cancelRegistration = async (registrationId) => {
  const response = await cancelApiRegistration(registrationId);
  if (response.ok && typeof showToast === "function") {
    showToast("Registration cancelled", "error");
  }
  return response;
};
