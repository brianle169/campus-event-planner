import { getEventById, getUserById, getRegistrationCountForEvent } from "../../data/sampleData.js";
import { isUpcoming, formatDate, formatTime } from "../../utils/dateHelpers.js";
import {
  EVENT_STATUS_BADGES,
  REGISTRATION_STATUS_BADGES,
  getMyRegistrationForEvent,
  isEventFull,
  registerForEvent,
  cancelRegistration,
} from "../../utils/registrations.js";

const getEventIdFromUrl = () => new URLSearchParams(window.location.search).get("id");

const renderNotFound = () => {
  document.getElementById("event-details-page").innerHTML = `
    <a class="event-details-back" href="events.html">&larr; Back to all events</a>
    <p class="event-details-empty">We couldn't find that event. It may have been removed.</p>
  `;
};

const renderRegistrationState = (event) => {
  const statusContainer = document.getElementById("detail-registration-status");
  const actionsContainer = document.getElementById("detail-actions");
  statusContainer.innerHTML = "";
  actionsContainer.innerHTML = "";

  const myRegistration = getMyRegistrationForEvent(event.event_id);

  if (myRegistration) {
    const badge = REGISTRATION_STATUS_BADGES[myRegistration.status];
    statusContainer.innerHTML = `Your registration: <span class="badge ${badge.className}">${badge.label}</span>`;

    if (myRegistration.status === "registered") {
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn btn-danger";
      cancelBtn.textContent = "Cancel registration";
      cancelBtn.addEventListener("click", () => {
        cancelRegistration(myRegistration.registration_id);
        renderEvent(event);
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
      ? EVENT_STATUS_BADGES[event.status].label
      : "Past event";
  } else if (isEventFull(event)) {
    registerBtn.className = "btn btn-outline";
    registerBtn.disabled = true;
    registerBtn.textContent = "Full";
  } else {
    registerBtn.className = "btn btn-primary";
    registerBtn.textContent = "Register";
    registerBtn.addEventListener("click", () => {
      registerForEvent(event.event_id);
      renderEvent(event);
    });
  }
  actionsContainer.appendChild(registerBtn);
};

function renderEvent(event) {
  const organizer = getUserById(event.organizer_id);
  const statusBadge = EVENT_STATUS_BADGES[event.status];

  document.getElementById("detail-category").textContent = event.category;
  document.getElementById("detail-title").textContent = event.title;
  document.getElementById("detail-description").textContent = event.description;
  document.getElementById("detail-date").textContent = formatDate(event.event_date);
  document.getElementById("detail-time").textContent =
    `${formatTime(event.start_time)} – ${formatTime(event.end_time)}`;
  document.getElementById("detail-location").textContent = event.location;
  document.getElementById("detail-organizer").textContent = organizer ? organizer.full_name : "TBD";
  document.getElementById("detail-seats").textContent =
    `${getRegistrationCountForEvent(event.event_id)} / ${event.capacity}`;

  const statusEl = document.getElementById("detail-status-badge");
  statusEl.textContent = statusBadge.label;
  statusEl.className = `badge ${statusBadge.className}`;

  renderRegistrationState(event);
}

document.addEventListener("DOMContentLoaded", () => {
  const event = getEventById(getEventIdFromUrl());
  if (!event) {
    renderNotFound();
    return;
  }
  renderEvent(event);
});
