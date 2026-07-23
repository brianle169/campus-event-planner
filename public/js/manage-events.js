import { fetchEvents } from './api/eventsApi.js';
import { formatDate, getBadgeClass } from './utils/eventUtils.js';

const tableBody = document.querySelector('#events-table-body');
const searchInput = document.querySelector('#search');
const searchButton = document.querySelector('#search-button');

let allEvents = [];

function buildEventTableRows(events) {
  return events.map((event) => {
    const badgeClass = getBadgeClass(event.status);
    const formattedDate = formatDate(event.date);

    return `
      <tr>
        <td>${event.title}</td>
        <td>${event.category}</td>
        <td>${formattedDate}</td>
        <td>${event.registeredCount} / ${event.capacity}</td>
        <td><span class="badge ${badgeClass}">${event.status}</span></td>
        <td class="row-actions">
          <a class="btn btn-outline btn-sm" href="edit-event.html">Edit</a>
          <button class="btn btn-danger btn-sm" type="button" data-toast="Event deleted" data-toast-type="error">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderEvents() {
  if (!tableBody) return;

  const query = searchInput?.value.trim().toLowerCase() || '';
  const filteredEvents = allEvents.filter((event) => event.title.toLowerCase().includes(query));

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
  renderEvents();
}
// TODO : Add event listeners for filtering the dropdowns too
searchButton?.addEventListener('click', (event) => {
  event.preventDefault();
  renderEvents();
});
searchInput?.addEventListener('input', (event) => {
    event.preventDefault();
    renderEvents();
});

loadEvents();
