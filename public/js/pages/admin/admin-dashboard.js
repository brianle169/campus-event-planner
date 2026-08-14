import { fetchEvents, fetchRegistrations } from "../../api/eventsApi.js";
import { getAdminStats, getStudentStats } from "../../api/adminApi.js";
import { formatDate, getBadgeClass } from "../../utils/eventUtils.js";
import { requireAuth } from "../../utils/authGuard.js";

const tableBody = document.querySelector("#recent-events-body");
const totalEventsValue = document.querySelector("#total-events-value");
const totalRegistrationsValue = document.querySelector(
  "#total-registrations-value",
);
const upcomingEventsValue = document.querySelector("#upcoming-events-value");
const fullEventsValue = document.querySelector("#full-events-value");

function buildEventTableRows(events) {
  return events
    .map((event) => {
      const badgeClass = getBadgeClass(event.status);
      const formattedDate = formatDate(event.event_date);
      let percentCapacity = 0;
      if (event.capacity > 0) {
        percentCapacity = Math.round(
          (event.registrationCount / event.capacity) * 100,
        );
      }

      return `
      <tr>
        <td><a href="/admin/events/${event.event_id}/edit">${event.title}</a></td>
        <td>${formattedDate}</td>
        <td><a href="/admin/registrations?event=${event.event_id}">${event.registrationCount} / ${event.capacity}</a></td>
        <td>${percentCapacity}%</td>
        <td><span class="badge ${badgeClass}">${event.status}</span></td>
        <td><a class="btn btn-outline btn-sm" href="/admin/events/${event.event_id}/edit">Edit</a></td>
      </tr>
    `;
    })
    .join("");
}

function renderSummaryCards(events) {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.event_date);
    return (
      eventDate >= startOfToday &&
      !["cancelled", "completed"].includes(event.status)
    );
  });

  const fullEvents = events.filter((event) => event.status === "full");
  const totalRegistrations = events.reduce(
    (sum, event) => sum + Number(event.registrationCount || 0),
    0,
  );

  if (totalEventsValue) totalEventsValue.textContent = events.length;
  if (totalRegistrationsValue)
    totalRegistrationsValue.textContent = totalRegistrations;
  if (upcomingEventsValue)
    upcomingEventsValue.textContent = upcomingEvents.length;
  if (fullEventsValue) fullEventsValue.textContent = fullEvents.length;
}

const totalAttendanceValue = document.querySelector("#total-attendance-value");

async function renderAttendanceStat() {
  const res = await getStudentStats();
  if (res.ok && res.data) {
    const attendedObj = res.data.registrationsByStatus.find(s => s.status === 'attended');
    if (totalAttendanceValue) {
      totalAttendanceValue.textContent = attendedObj ? attendedObj.count : 0;
    }
  }
}

const computePopularCategories = (registrations, events, limit = 8) => {
  const counts = new Map();

  registrations
    .filter((r) => r.status !== "cancelled")
    .forEach((r) => {
      const event = events.find(e => e.event_id == r.event_id);
      const category = event?.category || "Other";
      counts.set(category, (counts.get(category) || 0) + 1);
    });

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const renderPopularCategories = (registrations, events) => {
  const list = document.getElementById("category-list");
  if (!list) return;
  list.innerHTML = "";

  const topCategories = computePopularCategories(registrations, events);
  console.log("Top Categories:", topCategories);

  if (topCategories.length === 0) {
    const empty = document.createElement("p");
    empty.className = "category-stats-empty";
    empty.textContent = "No registrations record found.";
    list.appendChild(empty);
    return;
  }

  const maxCount = topCategories[0].count;

  topCategories.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "category-stat-item";
    item.innerHTML = `
      <span class="category-stat-rank">${index + 1}</span>
      <div class="category-stat-info">
        <span class="category-stat-name">
          ${entry.category}
          <span class="category-stat-count">${entry.count} registration${entry.count === 1 ? "" : "s"}</span>
        </span>
      </div>
    `;
    list.appendChild(item);
  });
};

async function renderDashboard() {
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  const events = await fetchEvents();
  const recentEvents = events.slice(0, 3);

  tableBody.innerHTML = buildEventTableRows(recentEvents);
  renderSummaryCards(events);
  renderAttendanceStat();
  renderPopularCategories(await fetchRegistrations(), events);
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth({ allowedRoles: ["admin"] });
  if (!user) return;
  renderDashboard();
});
