import {
  events,
  categories,
  getUserById,
  getRegistrationCountForEvent,
} from "../data/sampleData.js";
import { isUpcoming, formatDate, formatTime } from "../utils/dateHelpers.js";
import {
  EVENT_STATUS_BADGES,
  isRegisteredByCurrentUser,
  isEventFull,
  registerForEvent,
} from "../utils/registrations.js";

const filters = {
  search: "",
  category: "",
  location: "",
  organizerId: "",
  date: "",
};

const populateFilterOptions = () => {
  const categorySelect = document.getElementById("filter-category");
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.category_name;
    option.textContent = category.category_name;
    categorySelect.appendChild(option);
  });

  const locationSelect = document.getElementById("filter-location");
  [...new Set(events.map((event) => event.location))]
    .sort()
    .forEach((location) => {
      const option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      locationSelect.appendChild(option);
    });

  const organizerSelect = document.getElementById("filter-organizer");
  [...new Set(events.map((event) => event.organizer_id))]
    .map((organizerId) => getUserById(organizerId))
    .filter(Boolean)
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
    .forEach((organizer) => {
      const option = document.createElement("option");
      option.value = organizer.user_id;
      option.textContent = organizer.full_name;
      organizerSelect.appendChild(option);
    });
};

const getFilteredEvents = () =>
  events
    .filter((event) => {
      if (
        filters.search &&
        !event.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.category && event.category !== filters.category) return false;
      if (filters.location && event.location !== filters.location) return false;
      if (filters.organizerId && event.organizer_id !== filters.organizerId) {
        return false;
      }
      if (filters.date && event.event_date !== filters.date) return false;
      return true;
    })
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

const buildActionButton = (event) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-sm";

  if (isRegisteredByCurrentUser(event.event_id)) {
    button.classList.add("btn-outline");
    button.textContent = "Registered";
    button.disabled = true;
  } else if (event.status !== "open" || !isUpcoming(event.event_date)) {
    button.classList.add("btn-outline");
    button.textContent = isUpcoming(event.event_date)
      ? EVENT_STATUS_BADGES[event.status].label
      : "Past event";
    button.disabled = true;
  } else if (isEventFull(event)) {
    button.classList.add("btn-outline");
    button.textContent = "Full";
    button.disabled = true;
  } else {
    button.classList.add("btn-primary");
    button.textContent = "Register";
    button.addEventListener("click", () => {
      registerForEvent(event.event_id);
      renderEvents();
    });
  }

  return button;
};

const buildEventCard = (event) => {
  const statusBadge = EVENT_STATUS_BADGES[event.status];
  const organizer = getUserById(event.organizer_id);

  const card = document.createElement("article");
  card.className = "event-card";
  card.innerHTML = `
    <div class="event-card-header">
      <span class="event-card-category">${event.category}</span>
      <span class="badge ${statusBadge.className}">${statusBadge.label}</span>
    </div>
    <h3 class="event-card-title"><a href="event-details.html?id=${event.event_id}">${event.title}</a></h3>
    <p class="event-card-description">${event.description}</p>
    <ul class="event-card-meta">
      <li>${formatDate(event.event_date)} &middot; ${formatTime(event.start_time)}&ndash;${formatTime(event.end_time)}</li>
      <li>${event.location}</li>
      <li>${getRegistrationCountForEvent(event.event_id)} / ${event.capacity} registered</li>
      <li>Hosted by ${organizer ? organizer.full_name : "TBD"}</li>
    </ul>
    <div class="event-card-actions"></div>
  `;

  card
    .querySelector(".event-card-actions")
    .appendChild(buildActionButton(event));

  return card;
};

const renderEvents = () => {
  const grid = document.getElementById("events-grid");
  const count = document.getElementById("events-count");
  grid.innerHTML = "";

  const filtered = getFilteredEvents();
  count.textContent = `${filtered.length} event${filtered.length === 1 ? "" : "s"} found`;

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "events-empty";
    empty.textContent = "No events match your filters.";
    grid.appendChild(empty);
    return;
  }

  filtered.forEach((event) => grid.appendChild(buildEventCard(event)));
};

const readFiltersFromForm = () => {
  filters.search = document.getElementById("filter-search").value.trim();
  filters.category = document.getElementById("filter-category").value;
  filters.location = document.getElementById("filter-location").value;
  filters.organizerId = document.getElementById("filter-organizer").value;
  filters.date = document.getElementById("filter-date").value;
  renderEvents();
};

const attachFilterListeners = () => {
  const form = document.getElementById("event-filters-form");
  form.addEventListener("submit", (event) => event.preventDefault());
  form.addEventListener("input", readFiltersFromForm);
  form.addEventListener("change", readFiltersFromForm);
  form.addEventListener("reset", () => {
    Object.keys(filters).forEach((key) => {
      filters[key] = "";
    });
    setTimeout(renderEvents, 0);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  populateFilterOptions();
  attachFilterListeners();
  renderEvents();
});
