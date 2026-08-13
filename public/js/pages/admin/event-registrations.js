import { fetchEvents, fetchRegistrations } from '../../api/eventsApi.js';
import { updateAttendance } from '../../api/adminApi.js';
import { formatDate } from '../../utils/eventUtils.js';
import { showConfirmModal } from '../../utils/modal.js';
import { notifyError } from '../../utils/notify.js';
import { requireAuth } from '../../utils/authGuard.js';

const tableBody = document.querySelector('#registrations-table-body');
const eventTitle = document.querySelector('#event-title');
const eventFilter = document.querySelector('#filter-event');

let allRegistrations = [];
let allEvents = [];

function buildRegistrationTableRows(registrations) {
  return registrations.map((reg) => {
    const user = { full_name: reg.full_name || 'Unknown', email: reg.email || 'N/A' };
    const event = allEvents.find(e => e.event_id === reg.event_id) || { title: 'Unknown' };
    const formattedDate = formatDate(reg.registration_date);
    
    const isAttended = reg.attended ? 'checked' : '';
    const badgeClass = reg.status === 'registered' ? 'badge-open' : (reg.status === 'cancelled' ? 'badge-cancelled' : 'badge-completed');

    return `
      <tr>
        <td>${event.title}</td>
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td>${formattedDate}</td>
        <td><span class="badge ${badgeClass}">${reg.status}</span></td>
        <td>
          <input type="checkbox" class="attendance-checkbox" data-id="${reg.registration_id}" ${isAttended} /> Attended
        </td>
      </tr>
    `;
  }).join('');
}

async function loadRegistrations() {
  if (!tableBody) return;

  // ?event= preselects the filter; with no param the page lists every
  // registration, which is how the nav links here.
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('event');

  tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';

  const [registrations, events] = await Promise.all([
    fetchRegistrations(),
    fetchEvents()
  ]);
  
  allEvents = events;
  allRegistrations = registrations;

  if (eventFilter) {
    allEvents.forEach((evt) => {
      const option = document.createElement('option');
      option.value = evt.event_id;
      option.textContent = evt.title;
      eventFilter.appendChild(option);
    });

    if (eventId) {
      eventFilter.value = eventId;
    }

    eventFilter.addEventListener('change', () => {
      renderFilteredRegistrations();
    });
  }

  renderFilteredRegistrations();
}

function renderFilteredRegistrations() {
  const selectedEventId = eventFilter ? eventFilter.value : '';
  let filteredRegistrations = allRegistrations;
  
  if (selectedEventId) {
    filteredRegistrations = allRegistrations.filter(r => r.event_id == selectedEventId);
    const event = allEvents.find(e => e.event_id == selectedEventId);
    if (event && eventTitle) eventTitle.textContent = `Registrations for: ${event.title}`;
  } else {
    if (eventTitle) eventTitle.textContent = 'All Registrations';
  }

  if (filteredRegistrations.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No registrations found</td></tr>';
    return;
  }

  tableBody.innerHTML = buildRegistrationTableRows(filteredRegistrations);
}

tableBody?.addEventListener('change', async (event) => {
  if (event.target.classList.contains('attendance-checkbox')) {
    const confirmed = await showConfirmModal("Are you sure you want to update this student's attendance?", "Update", "btn-primary");
    if (!confirmed) {
        event.target.checked = !event.target.checked;
        return;
    }
    
    const id = event.target.dataset.id;
    const isChecked = event.target.checked;
    const reg = allRegistrations.find(r => r.registration_id == id);
    if (reg) {
      const newStatus = isChecked ? 'attended' : 'registered';
      const res = await updateAttendance(reg.event_id, reg.registration_id, newStatus, isChecked ? 1 : 0);
      
      if (res.ok) {
          reg.attended = isChecked;
          reg.status = newStatus;
          renderFilteredRegistrations();
      } else {
          notifyError(res.data?.error || "Failed to update attendance");
          event.target.checked = !isChecked; // revert
      }
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth({ allowedRoles: ['admin'] });
  if (!user) return;
  loadRegistrations();
});
