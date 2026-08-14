import { fetchCurrentUser } from "../../api/authApi.js";
import { fetchEvents } from "../../api/eventsApi.js";
import { fetchMyRegistrations, cancelRegistration as cancelApiRegistration } from "../../api/registrationsApi.js";
import { isUpcoming, formatDate } from "../../utils/dateHelpers.js";
import { requireAuth } from "../../utils/authGuard.js";

const state = {
  user: null,
  events: [],
  registrations: [],
};

const computeStats = (myRegs) => ({
  totalRegistered: myRegs.filter((r) => r.status !== "cancelled").length,
  upcoming: myRegs.filter(
    (r) => r.status === "registered" && isUpcoming(r.event_date),
  ).length,
  attended: myRegs.filter((r) => r.status === "attended").length,
});

const renderGreeting = () => {
  const el = document.getElementById("dashboard-greeting");
  if (!el || !state.user) return;
  const nameSplit = state.user.full_name.split(" ");
  const firstName = nameSplit.reduce((acc, val, index, arr) => {
    if (index === arr.length - 1 && val.length <= 3) {
      return acc;
    }
    return acc + (acc ? " " : "") + val;
  }, "");
  el.textContent = `Welcome back, ${firstName}`;
};

const renderStats = (stats) => {
  document.getElementById("stat-total-registered").textContent = stats.totalRegistered;
  document.getElementById("stat-upcoming").textContent = stats.upcoming;
  document.getElementById("stat-attended").textContent = stats.attended;
};

const renderUpcomingTable = (myRegs) => {
  const grid = document.getElementById("upcoming-events-body");
  grid.innerHTML = "";

  const upcoming = myRegs
    .filter((r) => r.status === "registered" && isUpcoming(r.event_date))
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  if (upcoming.length === 0) {
    const empty = document.createElement("p");
    empty.className = "upcoming-events-empty";
    empty.textContent = "You have no upcoming registered events.";
    grid.appendChild(empty);
    return;
  }

  upcoming.forEach((registration) => {
    const event = state.events.find((item) => item.event_id === registration.event_id) || {};
    const badgeClass = registration.status === "registered" ? "badge-open" : "badge-cancelled";
    const badgeLabel = registration.status === "registered" ? "Registered" : registration.status;

    const card = document.createElement("article");
    card.className = "upcoming-event-card";
    card.innerHTML = `
      <div class="upcoming-event-info">
        <h3 class="upcoming-event-title">
          <a href="/student/events/${event.event_id ?? registration.event_id}">${event.title ?? "Event"}</a>
        </h3>
        <p class="upcoming-event-meta">${formatDate(event.event_date ?? registration.event_date)} &middot; ${event.location ?? "TBD"}</p>
      </div>
      <div class="upcoming-event-actions">
        <span class="badge ${badgeClass}">${badgeLabel}</span>
      </div>
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-danger btn-sm";
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", async () => {
      const res = await cancelApiRegistration(registration.registration_id);
      if (res.ok) {
        state.registrations = await fetchMyRegistrations();
        renderDashboard();
      }
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

  const suggestions = state.events
    .filter(
      (event) =>
        event.runTimeStatus === "open" &&
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
      <a class="btn btn-outline btn-sm" href="/student/events/${event.event_id}">View</a>
    `;
    list.appendChild(item);
  });
};

const computeTopCategories = (myRegs, limit = 3) => {
  const counts = new Map();

  myRegs
    .filter((r) => r.status !== "cancelled")
    .forEach((r) => {
      const event = state.events.find((item) => item.event_id === r.event_id) || {};
      const category = event.category || "Other";
      counts.set(category, (counts.get(category) || 0) + 1);
    });

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const renderCategoryStats = (myRegs) => {
  const list = document.getElementById("category-stats-list");
  if (!list) return;
  list.innerHTML = "";

  const topCategories = computeTopCategories(myRegs);

  if (topCategories.length === 0) {
    const empty = document.createElement("p");
    empty.className = "category-stats-empty";
    empty.textContent = "Register for events to see your top categories.";
    list.appendChild(empty);
    return;
  }

  topCategories.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "category-stat-item";
    item.innerHTML = `
      <span class="category-stat-rank">${index + 1}</span>
      <div class="category-stat-info">
        <span class="category-stat-name">
          ${entry.category}
          <span class="category-stat-count">${entry.count} event${entry.count === 1 ? "" : "s"}</span>
        </span>
      </div>
    `;
    list.appendChild(item);
  });
};

function renderDashboard() {
  const myRegs = state.registrations;
  renderGreeting();
  renderStats(computeStats(myRegs));
  renderUpcomingTable(myRegs);
  renderRecommended(myRegs);
  renderCategoryStats(myRegs);
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth({ allowedRoles: ["student"] });
  if (!user) return;

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

  renderDashboard();
});
