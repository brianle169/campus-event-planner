import { fetchEvents, fetchRegistrations } from "../../api/eventsApi.js";
import { formatDate, getBadgeClass } from "../../utils/eventUtils.js";
import { getEventById } from "../../data/sampleData.js";

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
          (event.registeredCount / event.capacity) * 100,
        );
      }

      return `
      <tr>
        <td><a href="edit-event.html?id=${event.event_id}">${event.title}</a></td>
        <td>${formattedDate}</td>
        <td><a href="event-registrations.html?id=${event.event_id}">${event.registeredCount} / ${event.capacity}</a></td>
        <td>${percentCapacity}%</td>
        <td><span class="badge ${badgeClass}">${event.status}</span></td>
        <td><a class="btn btn-outline btn-sm" href="edit-event.html">Edit</a></td>
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
    (sum, event) => sum + Number(event.registeredCount || 0),
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
  const registrations = await fetchRegistrations();
  const totalAttendance = registrations.filter(
    (r) => r.status === "attended",
  ).length;
  if (totalAttendanceValue) {
    totalAttendanceValue.textContent = totalAttendance;
  }
}

const computePopularCategories = (registrations, limit = 8) => {
  const counts = new Map();

  registrations
    .filter((r) => r.status !== "cancelled")
    .forEach((r) => {
      const category = getEventById(r.event_id)?.category || "Other";
      counts.set(category, (counts.get(category) || 0) + 1);
    });

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const renderPopularCategories = (registrations) => {
  const list = document.getElementById("category-list");
  if (!list) return;
  list.innerHTML = "";

  const topCategories = computePopularCategories(registrations);
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
  renderPopularCategories(await fetchRegistrations());
}

renderDashboard();
