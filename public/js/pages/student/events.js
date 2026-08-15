import { fetchEvents } from "../../api/eventsApi.js";
import {
  fetchMyRegistrations,
  registerForEvent as registerForApiEvent,
  cancelRegistration as cancelApiRegistration,
} from "../../api/registrationsApi.js";
import { fetchCurrentUser } from "../../api/authApi.js";
import { isUpcoming, formatDate, formatTime } from "../../utils/dateHelpers.js";
import { validateDateRange } from "../../utils/inputValidation.js";
import { requireAuth } from "../../utils/authGuard.js";

const state = {
  currentUser: null,
  events: [],
  myRegistrations: [],
};

const filters = {
  search: "",
  category: "",
  location: "",
  organizerId: "",
  startDate: "",
  endDate: "",
};

const populateFilterOptions = () => {
  const categorySelect = document.getElementById("filter-category");
  const categories = [...new Set(state.events.map((event) => event.category))].sort();

  categorySelect.innerHTML = '<option value="">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  const locationSelect = document.getElementById("filter-location");
  locationSelect.innerHTML = '<option value="">All locations</option>';
  [...new Set(state.events.map((event) => event.location))]
    .sort()
    .forEach((location) => {
      const option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      locationSelect.appendChild(option);
    });

  const organizerSelect = document.getElementById("filter-organizer");
  organizerSelect.innerHTML = '<option value="">All admins</option>';
  [...new Set(state.events.map((event) => event.organizer_id))]
    .filter(Boolean)
    .sort()
    .forEach((organizerId) => {
      const option = document.createElement("option");
      option.value = organizerId;
      option.textContent = `Organizer ${organizerId}`;
      organizerSelect.appendChild(option);
    });
};

const getFilteredEvents = () =>
  state.events
    .filter((event) => {
      if (
        filters.search &&
        !event.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.category && event.category !== filters.category) return false;
      if (filters.location && event.location !== filters.location) return false;
      if (filters.organizerId && String(event.organizer_id) !== String(filters.organizerId)) {
        return false;
      }
      if (filters.startDate && event.event_date < filters.startDate)
        return false;
      if (filters.endDate && event.event_date > filters.endDate) return false;
      return true;
    })
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

const getMyRegistrationForEvent = (eventId) =>
  state.myRegistrations.find(
    (registration) =>
      Number(registration.event_id) === Number(eventId) &&
      registration.status !== "cancelled",
  );

const buildActionButton = (event) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-sm";

  const myRegistration = getMyRegistrationForEvent(event.event_id);

  if (myRegistration && isUpcoming(event.event_date)) {
    button.classList.add("btn-danger", "btn-primary");
    button.textContent = "Cancel";
    button.addEventListener("click", async () => {
      const res = await cancelApiRegistration(myRegistration.registration_id);
      if (res.ok) {
        state.myRegistrations = await fetchMyRegistrations();
        renderEvents();
      }
    });
  } else if (event.status !== "open" || !isUpcoming(event.event_date)) {
    button.classList.add("btn-outline");
    button.textContent = isUpcoming(event.event_date)
      ? event.status
      : "Past event";
    button.disabled = true;
  } else if (event.registrationCount >= event.capacity) {
    button.classList.add("btn-outline");
    button.textContent = "Full";
    button.disabled = true;
  } else {
    button.classList.add("btn-primary");
    button.textContent = "Register";
    button.addEventListener("click", async () => {
      const res = await registerForApiEvent(event.event_id);
      if (res.ok) {
        state.myRegistrations = await fetchMyRegistrations();
        const refreshed = await fetchEvents();
        state.events = refreshed;
        renderEvents();
      }
    });
  }

  return button;
};

const buildEventCard = (event) => {
  const card = document.createElement("article");
  card.className = "event-card";
  card.innerHTML = `
    <div class="event-card-header">
      <span class="event-card-category">${event.category}</span>
      <span class="badge ${event.status === "open" ? "badge-open" : "badge-cancelled"}">${event.status}</span>
    </div>
    <h3 class="event-card-title"><a href="/student/events/${event.event_id}">${event.title}</a></h3>
    <p class="event-card-description">${event.description}</p>
    <ul class="event-card-meta">
      <li>${formatDate(event.event_date)} &middot; ${formatTime(event.start_time)}&ndash;${formatTime(event.end_time)}</li>
      <li>${event.location}</li>
      <li>${event.registrationCount ?? 0} / ${event.capacity} registered</li>
      <li>Hosted by organizer ${event.organizer_id ?? "TBD"}</li>
    </ul>
    <div class="event-card-actions"></div>
  `;

  card.querySelector(".event-card-actions").appendChild(buildActionButton(event));
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

const setFieldError = (input, message) => {
  const errorEl = document.getElementById(`${input.id}-error`);
  input.classList.toggle("invalid", Boolean(message));
  if (errorEl) errorEl.textContent = message;
};

const readFiltersFromForm = () => {
  const startDateInput = document.getElementById("filter-start-date");
  const endDateInput = document.getElementById("filter-end-date");
  const rangeError = validateDateRange(
    startDateInput.value,
    endDateInput.value,
  );
  setFieldError(endDateInput, rangeError);

  filters.search = document.getElementById("filter-search").value.trim();
  filters.category = document.getElementById("filter-category").value;
  filters.location = document.getElementById("filter-location").value;
  filters.organizerId = document.getElementById("filter-organizer").value;
  filters.startDate = startDateInput.value;
  filters.endDate = rangeError ? "" : endDateInput.value;
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
    setFieldError(document.getElementById("filter-end-date"), "");
    setTimeout(renderEvents, 0);
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth({ allowedRoles: ["student"] });
  if (!user) return;

  try {
    const [userResponse, events, registrations] = await Promise.all([
      fetchCurrentUser(),
      fetchEvents(),
      fetchMyRegistrations(),
    ]);
    state.currentUser = userResponse.data?.user ?? user;
    state.events = events;
    state.myRegistrations = registrations;
  } catch (error) {
    console.error("Failed to load events or registrations", error);
  }

  populateFilterOptions();
  attachFilterListeners();
  renderEvents();
});
