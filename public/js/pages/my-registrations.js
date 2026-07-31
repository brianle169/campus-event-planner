import {
  currentUser,
  registrations,
  getEventById,
} from "../data/sampleData.js";
import { formatDate } from "../utils/dateHelpers.js";
import { cancelRegistration } from "../utils/registrations.js";

// Badge CSS mappings matching project spec
const REGISTRATION_BADGES = {
  registered: { label: "Registered", className: "status-registered" },
  attended: { label: "Attended", className: "status-attended" },
  missed: { label: "Missed", className: "badge-cancelled" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
};

// Retrieve currentUser's registrations with associated event details attached
const getMyRegistrations = () =>
  registrations
    .filter((registration) => registration.user_id === currentUser.user_id)
    .map((registration) => ({
      ...registration,
      event: getEventById(registration.event_id),
    }));

// Calculate stat card values
const computeStats = (myRegs) => ({
  totalRegistered: myRegs.filter((r) => r.status !== "cancelled").length,
  upcoming: myRegs.filter((r) => r.status === "registered").length,
  attended: myRegs.filter((r) => r.status === "attended").length,
});

// Render upper stat counters
const renderStats = (stats) => {
  const totalEl = document.getElementById("stat-total-registered");
  const upcomingEl = document.getElementById("stat-upcoming");
  const attendedEl = document.getElementById("stat-attended");

  if (totalEl) totalEl.textContent = stats.totalRegistered;
  if (upcomingEl) upcomingEl.textContent = stats.upcoming;
  if (attendedEl) attendedEl.textContent = stats.attended;
};

// Render registered event cards in my-registrations.html
const renderRegistrationsList = (myRegs) => {
  const container = document.getElementById("registered-events-body");
  if (!container) return;

  container.innerHTML = "";

  // Filter out cancelled registrations and sort by event date
  const activeRegs = myRegs
    .filter((r) => r.status !== "cancelled")
    .sort(
      (a, b) => new Date(a.event.event_date) - new Date(b.event.event_date),
    );

  if (activeRegs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "upcoming-events-empty";
    empty.textContent = "You have no registered events at this time.";
    container.appendChild(empty);
    return;
  }

  activeRegs.forEach((registration) => {
    const { event } = registration;
    const badge = REGISTRATION_BADGES[registration.status] || {
      label: registration.status,
      className: "status-registered",
    };

    const card = document.createElement("article");
    card.className = `upcoming-event-card ${
      registration.status === "attended" ? "attended-card" : ""
    }`;

    // Format time display
    const timeFormatted = event.start_time
      ? ` | ${event.start_time} - ${event.end_time}`
      : "";

    card.innerHTML = `
      <div class="upcoming-event-info">
        <div class="badge-group">
          <span class="badge category-badge">${event.category || "General"}</span>
          <span class="badge ${badge.className}">${badge.label}</span>
        </div>
        <h3 class="upcoming-event-title">${event.title}</h3>
        <p class="upcoming-event-meta">
          ${formatDate(event.event_date)}${timeFormatted} <br />
          ${event.location}
        </p>
      </div>
      <div class="upcoming-event-actions">
        <a href="event-details.html?id=${event.event_id}" class="btn btn-outline btn-sm">View Details</a>
      </div>
    `;

    // Only add the Cancel button if the event is currently registered (not already attended)
    if (registration.status === "registered") {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-danger btn-sm";
      cancelBtn.type = "button";
      cancelBtn.textContent = "Cancel Registration";
      cancelBtn.addEventListener("click", () => {
        (cancelRegistration(registration.registration_id),
          renderRegistrationsList(getMyRegistrations()));
      });
      card.querySelector(".upcoming-event-actions").appendChild(cancelBtn);
    }

    container.appendChild(card);
  });
};

// Primary render function
function renderMyRegistrationsPage() {
  const myRegs = getMyRegistrations();
  renderStats(computeStats(myRegs));
  renderRegistrationsList(myRegs);
}

document.addEventListener("DOMContentLoaded", renderMyRegistrationsPage);
