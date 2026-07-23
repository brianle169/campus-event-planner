import { fetchEvents } from './api/eventsApi.js';
import { formatDate, getBadgeClass } from './utils/eventUtils.js';

const tableBody = document.querySelector('#recent-events-body');

function buildEventTableRows(events) {
  return events.map((event) => {
    const badgeClass = getBadgeClass(event.status);
    const formattedDate = formatDate(event.date);

    return `
      <tr>
        <td>${event.title}</td>
        <td>${formattedDate}</td>
        <td>${event.registeredCount} / ${event.capacity}</td>
        <td><span class="badge ${badgeClass}">${event.status}</span></td>
        <td><a class="btn btn-outline btn-sm" href="edit-event.html">Edit</a></td>
      </tr>
    `;
  }).join('');
}

async function renderRecentEvents() {
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  const events = await fetchEvents();
  const recentEvents = events.slice(0, 3);

  tableBody.innerHTML = buildEventTableRows(recentEvents);
}

renderRecentEvents();
