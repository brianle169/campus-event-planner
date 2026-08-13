import { getEvent } from "../../api/eventsApi.js";
import { fetchMyRegistrations, registerForEvent as registerForApiEvent, cancelRegistration as cancelApiRegistration } from "../../api/registrationsApi.js";
import { isUpcoming, formatDate, formatTime } from "../../utils/dateHelpers.js";

const state = {
  event: null,
  myRegistrations: [],
};

// The id is the last segment of /student/events/:id.
const getEventIdFromUrl = () =>
  window.location.pathname.split("/").filter(Boolean).pop();

const renderNotFound = () => {
  document.getElementById("event-details-page").innerHTML = `
    <a class="event-details-back" href="/student/events">&larr; Back to all events</a>
    <p class="event-details-empty">We couldn't find that event. It may have been removed.</p>
  `;
};

const renderRegistrationState = async (event) => {
  const statusContainer = document.getElementById("detail-registration-status");
  const actionsContainer = document.getElementById("detail-actions");
  statusContainer.innerHTML = "";
  actionsContainer.innerHTML = "";

  const myRegistration = state.myRegistrations.find(
    (registration) =>
      Number(registration.event_id) === Number(event.event_id) &&
      registration.status !== "cancelled",
  );

  if (myRegistration) {
    const badgeClass = myRegistration.status === "registered" ? "badge-open" : "badge-cancelled";
    const badgeLabel = myRegistration.status === "registered" ? "Registered" : myRegistration.status;
    statusContainer.innerHTML = `Your registration: <span class="badge ${badgeClass}">${badgeLabel}</span>`;

    if (myRegistration.status === "registered") {
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn btn-danger";
      cancelBtn.textContent = "Cancel registration";
      cancelBtn.addEventListener("click", async () => {
        const result = await cancelApiRegistration(myRegistration.registration_id);
        if (result.ok) {
          state.myRegistrations = await fetchMyRegistrations();
          const refreshed = await getEvent(event.event_id);
          renderEvent(refreshed);
        }
      });
      actionsContainer.appendChild(cancelBtn);
    }
    return;
  }

  const registerBtn = document.createElement("button");
  registerBtn.type = "button";

  if (event.status !== "open" || !isUpcoming(event.event_date)) {
    registerBtn.className = "btn btn-outline";
    registerBtn.disabled = true;
    registerBtn.textContent = isUpcoming(event.event_date)
      ? event.status
      : "Past event";
  } else if (Number(event.registrationCount || 0) >= Number(event.capacity || 0)) {
    registerBtn.className = "btn btn-outline";
    registerBtn.disabled = true;
    registerBtn.textContent = "Full";
  } else {
    registerBtn.className = "btn btn-primary";
    registerBtn.textContent = "Register";
    registerBtn.addEventListener("click", async () => {
      const result = await registerForApiEvent(event.event_id);
      if (result.ok) {
        state.myRegistrations = await fetchMyRegistrations();
        const refreshed = await getEvent(event.event_id);
        renderEvent(refreshed);
      }
    });
  }
  actionsContainer.appendChild(registerBtn);
};

function renderEvent(event) {
  document.getElementById("detail-category").textContent = event.category;
  document.getElementById("detail-title").textContent = event.title;
  document.getElementById("detail-description").textContent = event.description;
  document.getElementById("detail-date").textContent = formatDate(event.event_date);
  document.getElementById("detail-time").textContent =
    `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`;
  document.getElementById("detail-location").textContent = event.location;
  document.getElementById("detail-organizer").textContent = `Organizer ${event.organizer_id ?? "TBD"}`;
  document.getElementById("detail-seats").textContent =
    `${Number(event.registrationCount || 0)} / ${event.capacity}`;

  const statusEl = document.getElementById("detail-status-badge");
  statusEl.textContent = String(event.status || "open");
  statusEl.className = `badge ${event.status === "open" ? "badge-open" : "badge-cancelled"}`;

  renderRegistrationState(event);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    state.myRegistrations = await fetchMyRegistrations();
    const event = await getEvent(getEventIdFromUrl());
    if (!event) {
      renderNotFound();
      return;
    }
    renderEvent(event);
  } catch (error) {
    console.error(error);
    renderNotFound();
  }
});
