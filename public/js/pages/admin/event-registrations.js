import { fetchRegistrations, fetchEvents } from '../../api/eventsApi.js';
import { formatDate } from '../../utils/eventUtils.js';
import { getUserById } from '../../data/sampleData.js';

const tableBody = document.querySelector('#registrations-table-body');
const eventTitle = document.querySelector('#event-title');
const eventFilter = document.querySelector('#filter-event');

let allRegistrations = [];
let allEvents = [];

function buildRegistrationTableRows(registrations) {
  return registrations.map((reg) => {
    const user = getUserById(reg.user_id) || { full_name: 'Unknown', email: 'N/A' };
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
    filteredRegistrations = allRegistrations.filter(r => r.event_id === selectedEventId);
    const event = allEvents.find(e => e.event_id === selectedEventId);
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

tableBody?.addEventListener('change', (event) => {
  if (event.target.classList.contains('attendance-checkbox')) {
    const id = event.target.dataset.id;
    const isChecked = event.target.checked;
    const reg = allRegistrations.find(r => r.registration_id === id);
    if (reg) {
      reg.attended = isChecked;
      if (isChecked) {
        reg.status = 'attended';
      } else {
        reg.status = 'registered';
      }
      renderFilteredRegistrations();
      // Optional: show a toast notification
    }
  }
});

loadRegistrations();
