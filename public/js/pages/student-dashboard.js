import {
  currentUser,
  events,
  registrations,
  getEventById,
} from "../data/sampleData.js";
import { isUpcoming, formatDate } from "../utils/dateHelpers.js";
import {
  REGISTRATION_STATUS_BADGES,
  cancelRegistration as cancelRegistrationById,
} from "../utils/registrations.js";

const myRegistrations = () =>
  registrations
    .filter((registration) => registration.user_id === currentUser.user_id)
    .map((registration) => ({
      ...registration,
      event: getEventById(registration.event_id),
    }));

const computeStats = (myRegs) => ({
  totalRegistered: myRegs.filter((r) => r.status !== "cancelled").length,
  upcoming: myRegs.filter(
    (r) => r.status === "registered" && isUpcoming(r.event.event_date),
  ).length,
  attended: myRegs.filter((r) => r.status === "attended").length,
  cancelled: myRegs.filter((r) => r.status === "cancelled").length,
});

const renderGreeting = () => {
  const el = document.getElementById("dashboard-greeting");
  const nameSplit = currentUser.full_name.split(" ");
  const firstName = nameSplit.reduce((acc, val, index, arr) => {
    if (index === arr.length - 1 && val.length <= 3) {
      return acc;
    }
    return acc + (acc ? " " : "") + val;
  }, "");
  if (el) el.textContent = `Welcome back, ${firstName}`;
};

const renderStats = (stats) => {
  document.getElementById("stat-total-registered").textContent =
    stats.totalRegistered;
  document.getElementById("stat-upcoming").textContent = stats.upcoming;
  document.getElementById("stat-attended").textContent = stats.attended;
  document.getElementById("stat-cancelled").textContent = stats.cancelled;
};

const renderUpcomingTable = (myRegs) => {
  const grid = document.getElementById("upcoming-events-body");
  grid.innerHTML = "";

  const upcoming = myRegs
    .filter((r) => r.status === "registered" && isUpcoming(r.event.event_date))
    .sort(
      (a, b) => new Date(a.event.event_date) - new Date(b.event.event_date),
    );

  if (upcoming.length === 0) {
    const empty = document.createElement("p");
    empty.className = "upcoming-events-empty";
    empty.textContent = "You have no upcoming registered events.";
    grid.appendChild(empty);
    return;
  }

  upcoming.forEach((registration) => {
    const { event } = registration;
    const badge = REGISTRATION_STATUS_BADGES[registration.status];

    const card = document.createElement("article");
    card.className = "upcoming-event-card";
    card.innerHTML = `
      <div class="upcoming-event-info">
        <h3 class="upcoming-event-title">
          <a href="event-details.html?id=${event.event_id}">${event.title}</a>
        </h3>
        <p class="upcoming-event-meta">${formatDate(event.event_date)} &middot; ${event.location}</p>
      </div>
      <div class="upcoming-event-actions">
        <span class="badge ${badge.className}">${badge.label}</span>
      </div>
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-danger btn-sm";
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      cancelRegistrationById(registration.registration_id);
      renderDashboard();
    });
    card.querySelector(".upcoming-event-actions").appendChild(cancelBtn);

    grid.appendChild(card);
  });
};

const renderRecommended = (myRegs) => {
  const list = document.getElementById("recommended-list");
  list.innerHTML = "";

  const registeredEventIds = new Set(
    myRegs.filter((r) => r.status !== "cancelled").map((r) => r.event_id),
  );

  const suggestions = events
    .filter(
      (event) =>
        event.status === "open" &&
        isUpcoming(event.event_date) &&
        !registeredEventIds.has(event.event_id),
    )
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 3);

  suggestions.forEach((event) => {
    const item = document.createElement("li");
    item.className = "event-mini";
    item.innerHTML = `
      <div class="event-mini-info">
        <span class="event-mini-title">${event.title}</span>
        <span class="event-mini-meta">${formatDate(event.event_date)} &middot; ${event.category}</span>
      </div>
      <a class="btn btn-outline btn-sm" href="event-details.html?id=${event.event_id}">View</a>
    `;
    list.appendChild(item);
  });
};

function renderDashboard() {
  const myRegs = myRegistrations();
  renderGreeting();
  renderStats(computeStats(myRegs));
  renderUpcomingTable(myRegs);
  renderRecommended(myRegs);
}

document.addEventListener("DOMContentLoaded", renderDashboard);
