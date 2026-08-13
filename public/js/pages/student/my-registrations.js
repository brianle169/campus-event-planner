import { fetchCurrentUser } from "../../api/authApi.js";
import { fetchEvents } from "../../api/eventsApi.js";
import { fetchMyRegistrations, cancelRegistration } from "../../api/registrationsApi.js";
import { formatDate } from "../../utils/dateHelpers.js";

const state = {
  user: null,
  events: [],
  registrations: [],
};

const REGISTRATION_BADGES = {
  registered: { label: "Registered", className: "status-registered" },
  attended: { label: "Attended", className: "status-attended" },
  missed: { label: "Missed", className: "badge-cancelled" },
  cancelled: { label: "Cancelled", className: "badge-cancelled" },
};

const computeStats = (myRegs) => ({
  totalRegistered: myRegs.filter((r) => r.status !== "cancelled").length,
  upcoming: myRegs.filter((r) => r.status === "registered").length,
  attended: myRegs.filter((r) => r.status === "attended").length,
});

const renderStats = (stats) => {
  const totalEl = document.getElementById("stat-total-registered");
  const upcomingEl = document.getElementById("stat-upcoming");
  const attendedEl = document.getElementById("stat-attended");

  if (totalEl) totalEl.textContent = stats.totalRegistered;
  if (upcomingEl) upcomingEl.textContent = stats.upcoming;
  if (attendedEl) attendedEl.textContent = stats.attended;
};

const renderRegistrationsList = (myRegs) => {
  const container = document.getElementById("registered-events-body");
  if (!container) return;

  container.innerHTML = "";

  const activeRegs = myRegs
    .filter((r) => r.status !== "cancelled")
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  if (activeRegs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "upcoming-events-empty";
    empty.textContent = "You have no registered events at this time.";
    container.appendChild(empty);
    return;
  }

  activeRegs.forEach((registration) => {
    const event = state.events.find((item) => item.event_id === registration.event_id) || {};
    const badge = REGISTRATION_BADGES[registration.status] || {
      label: registration.status,
      className: "status-registered",
    };

    const card = document.createElement("article");
    card.className = `upcoming-event-card ${registration.status === "attended" ? "attended-card" : ""}`;

    const timeFormatted = event.start_time
      ? ` | ${event.start_time} - ${event.end_time}`
      : "";

    card.innerHTML = `
      <div class="upcoming-event-info">
        <div class="badge-group">
          <span class="badge category-badge">${event.category || "General"}</span>
          <span class="badge ${badge.className}">${badge.label}</span>
        </div>
        <h3 class="upcoming-event-title">${event.title || "Event"}</h3>
        <p class="upcoming-event-meta">
          ${formatDate(event.event_date || registration.event_date)}${timeFormatted} <br />
          ${event.location || "TBD"}
        </p>
      </div>
      <div class="upcoming-event-actions">
        <a href="/student/events/${event.event_id || registration.event_id}" class="btn btn-outline btn-sm">View Details</a>
      </div>
    `;

    if (registration.status === "registered") {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-danger btn-sm";
      cancelBtn.type = "button";
      cancelBtn.textContent = "Cancel Registration";
      cancelBtn.addEventListener("click", async () => {
        const result = await cancelRegistration(registration.registration_id);
        if (result.ok) {
          state.registrations = await fetchMyRegistrations();
          renderMyRegistrationsPage();
        }
      });
      card.querySelector(".upcoming-event-actions").appendChild(cancelBtn);
    }

    container.appendChild(card);
  });
};

function renderMyRegistrationsPage() {
  const myRegs = state.registrations;
  renderStats(computeStats(myRegs));
  renderRegistrationsList(myRegs);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [userResponse, events, registrations] = await Promise.all([
      fetchCurrentUser(),
      fetchEvents(),
      fetchMyRegistrations(),
    ]);
    state.user = userResponse.data?.user ?? null;
    state.events = events;
    state.registrations = registrations;
  } catch (error) {
    console.error(error);
  }

  renderMyRegistrationsPage();
});
