import { fetchEvents } from '../../api/eventsApi.js';
import { categoryOptions } from '../../data/sampleData.js';
import { formatCategory, formatDate, getBadgeClass } from '../../utils/eventUtils.js';

const tableBody = document.querySelector('#events-table-body');
const searchInput = document.querySelector('#search');
const categoryFilter = document.querySelector('#filter-category');
const statusFilter = document.querySelector('#filter-status');
const filterForm = document.querySelector('.event-filters');

let allEvents = [];

function populateCategoryFilter() {
  if (!categoryFilter) return;

  const categoryCounts = categoryOptions.reduce((counts, { value }) => {
    counts[value] = 0;
    return counts;
  }, {});

  allEvents.forEach((event) => {
    const categoryKey = formatCategory(event.category);
    if (categoryCounts[categoryKey] !== undefined) {
      categoryCounts[categoryKey] += 1;
    }
  });

  categoryFilter.innerHTML = '<option value="">All categories</option>';

  categoryOptions.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = `${label} (${categoryCounts[value] || 0})`;
    categoryFilter.appendChild(option);
  });
}

function buildEventTableRows(events) {
  return events.map((event) => {
    const badgeClass = getBadgeClass(event.status);
    const formattedDate = formatDate(event.event_date);
    const categoryLabel = formatCategory(event.category);
    let percentCapacity = 0;
    if (event.capacity > 0) {
      percentCapacity = Math.round((event.registeredCount / event.capacity) * 100);
    }

    return `
      <tr>
        <td><a href="/admin/events/${event.event_id}/edit">${event.title}</a></td>
        <td>${categoryLabel}</td>
        <td>${formattedDate}</td>
        <td><a href="/admin/registrations?event=${event.event_id}">${event.registeredCount} / ${event.capacity}</a></td>
        <td>${percentCapacity}%</td>
        <td><span class="badge ${badgeClass}">${event.status}</span></td>
        <td class="row-actions">
          <div style="margin-bottom: 5px;">
            <a class="btn btn-outline btn-sm" href="/admin/events/${event.event_id}/edit">Edit</a>
            <button class="btn btn-sm disable-event-btn" type="button" data-id="${event.event_id}" data-toast="Event disabled" data-toast-type="success" style="background-color: gray; color: white;">Disable</button>
          </div>
          <div>
            <button class="btn btn-danger btn-sm cancel-event-btn" type="button" data-id="${event.event_id}" data-toast="Event cancelled" data-toast-type="success">Cancel</button>
            <button class="btn btn-danger btn-sm delete-event-btn" type="button" data-id="${event.event_id}" data-toast="Event deleted" data-toast-type="error">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getFilteredEvents() {
  const query = searchInput?.value.trim().toLowerCase() || '';
  const selectedCategory = categoryFilter?.value || '';
  const selectedStatus = statusFilter?.value || '';

  return allEvents.filter((event) => {
    const titleMatch = event.title.toLowerCase().includes(query);
    const categoryMatch = !selectedCategory || formatCategory(event.category) === selectedCategory;
    const statusMatch = !selectedStatus || event.status === selectedStatus;

    return titleMatch && categoryMatch && statusMatch;
  });
}

function renderEvents() {
  if (!tableBody) return;

  const filteredEvents = getFilteredEvents();

  if (filteredEvents.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No events found</td></tr>';
    return;
  }

  tableBody.innerHTML = buildEventTableRows(filteredEvents);
}

async function loadEvents() {
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';

  const events = await fetchEvents();
  allEvents = events;
  populateCategoryFilter();
  renderEvents();
}

filterForm?.addEventListener('reset', () => {
  setTimeout(() => {
    renderEvents();
  }, 0);
});
tableBody?.addEventListener('click', (event) => {
  const deleteBtn = event.target.closest('.delete-event-btn');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    allEvents = allEvents.filter(e => e.event_id !== id);
    renderEvents();
    return;
  }
  
  const disableBtn = event.target.closest('.disable-event-btn');
  if (disableBtn) {
    const id = disableBtn.dataset.id;
    const evt = allEvents.find(e => e.event_id === id);
    if (evt) evt.status = 'disabled';
    renderEvents();
    return;
  }

  const cancelBtn = event.target.closest('.cancel-event-btn');
  if (cancelBtn) {
    const id = cancelBtn.dataset.id;
    const evt = allEvents.find(e => e.event_id === id);
    if (evt) evt.status = 'cancelled';
    renderEvents();
    return;
  }
});
searchInput?.addEventListener('input', () => {
  renderEvents();
});
categoryFilter?.addEventListener('change', () => {
  renderEvents();
});
statusFilter?.addEventListener('change', () => {
  renderEvents();
});

loadEvents();
