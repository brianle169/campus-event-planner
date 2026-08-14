import { fetchEvents } from '../../api/eventsApi.js';
import { updateEventStatus, deleteEvent } from '../../api/adminApi.js';
import { formatCategory, formatDate, getBadgeClass } from '../../utils/eventUtils.js';
import { showConfirmModal } from '../../utils/modal.js';
import { notifyError } from '../../utils/notify.js';
import { requireAuth } from '../../utils/authGuard.js';

const tableBody = document.querySelector('#events-table-body');
const searchInput = document.querySelector('#search');
const categoryFilter = document.querySelector('#filter-category');
const statusFilter = document.querySelector('#filter-status');
const filterForm = document.querySelector('.event-filters');

let allEvents = [];

const categoryOptions = [
  { value: 'Academic workshop', label: 'Academic workshop' },
  { value: 'Career event', label: 'Career event' },
  { value: 'Club activity', label: 'Club activity' },
  { value: 'Sports event', label: 'Sports event' },
  { value: 'Cultural event', label: 'Cultural event' },
  { value: 'Volunteering event', label: 'Volunteering event' },
  { value: 'Social event', label: 'Social event' },
  { value: 'Guest lecture', label: 'Guest lecture' },
  { value: 'Networking event', label: 'Networking event' },
  { value: 'Other', label: 'Other' },
];

function populateCategoryFilter() {
  if (!categoryFilter) return;

  const categoryCounts = categoryOptions.reduce((counts, { value }) => {
    counts[value] = 0;
    return counts;
  }, {});

  allEvents.forEach((event) => {
    const categoryKey = event.category; // formatCategory is just mapped
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
    const badgeClass = getBadgeClass(event.runTimeStatus);
    const formattedDate = formatDate(event.event_date);
    const categoryLabel = formatCategory(event.category);
    let percentCapacity = 0;
    if (event.capacity > 0) {
      percentCapacity = Math.round((event.registrationCount / event.capacity) * 100);
    }

    return `
      <tr>
        <td><a href="/admin/events/${event.event_id}/edit">${event.title}</a></td>
        <td>${categoryLabel}</td>
        <td>${formattedDate}</td>
        <td><a href="/admin/registrations?event=${event.event_id}">${event.registrationCount} / ${event.capacity}</a></td>
        <td>${percentCapacity}%</td>
        <td><span class="badge ${badgeClass}">${event.runTimeStatus}</span></td>
        <td class="row-actions">
          <div style="margin-bottom: 5px;">
            <a class="btn btn-outline btn-sm" href="/admin/events/${event.event_id}/edit">Edit</a>
            <button class="btn btn-sm disable-event-btn" type="button" data-id="${event.event_id}" style="background-color: gray; color: white;">Disable</button>
          </div>
          <div>
            <button class="btn btn-danger btn-sm cancel-event-btn" type="button" data-id="${event.event_id}">Cancel</button>
            <button class="btn btn-danger btn-sm delete-event-btn" type="button" data-id="${event.event_id}">Delete</button>
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
    const statusMatch = !selectedStatus || event.runTimeStatus === selectedStatus;

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
tableBody?.addEventListener('click', async (event) => {
  const deleteBtn = event.target.closest('.delete-event-btn');
  if (deleteBtn) {
    const confirmed = await showConfirmModal("Are you sure you want to permanently delete this event? This action cannot be undone.", "Delete", "btn-danger");
    if (!confirmed) return;
    
    const id = deleteBtn.dataset.id;
    const res = await deleteEvent(id);
    if (res.ok) {
        allEvents = allEvents.filter(e => e.event_id != id);
        renderEvents();
        notifySuccess("Event deleted");
    } else {
        notifyError(res.data?.error || "Failed to delete event");
    }
    return;
  }
  
  const disableBtn = event.target.closest('.disable-event-btn');
  if (disableBtn) {
    const confirmed = await showConfirmModal("Are you sure you want to disable this event?", "Disable", "btn-outline");
    if (!confirmed) return;
    
    const id = disableBtn.dataset.id;
    const res = await updateEventStatus(id, 'disabled');
    if (res.ok) {
        const evt = allEvents.find(e => e.event_id == id);
        if (evt) {
          evt.status = 'disabled';
          evt.dbStatus = 'disabled';
          evt.runTimeStatus = 'disabled';
        }
        renderEvents();
        notifySuccess("Event disabled");
    } else {
        notifyError(res.data?.error || "Failed to disable event");
    }
    return;
  }

  const cancelBtn = event.target.closest('.cancel-event-btn');
  if (cancelBtn) {
    const confirmed = await showConfirmModal("Are you sure you want to cancel this event?", "Cancel event", "btn-danger");
    if (!confirmed) return;
    
    const id = cancelBtn.dataset.id;
    const res = await updateEventStatus(id, 'cancelled');
    if (res.ok) {
        const evt = allEvents.find(e => e.event_id == id);
        if (evt) {
          evt.status = 'cancelled';
          evt.dbStatus = 'cancelled';
          evt.runTimeStatus = 'cancelled';
        }
        renderEvents();
        notifySuccess("Event cancelled");
    } else {
        notifyError(res.data?.error || "Failed to cancel event");
    }
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

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth({ allowedRoles: ['admin'] });
  if (!user) return;
  loadEvents();
});
