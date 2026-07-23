import { fetchEvents } from './api/eventsApi.js';
import { formatDate, getBadgeClass } from './utils/eventUtils.js';

const tableBody = document.querySelector('#events-table-body');

async function renderEvents() {
  if (!tableBody) return;

  const events = await fetchEvents();

  const rows = events.map((event) => {
    const formattedDate = formatDate(event.date);
    const badgeClass = getBadgeClass(event.status);

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

  tableBody.innerHTML = rows;
}

renderEvents();
