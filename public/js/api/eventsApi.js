// Mock a backend api call to fetch events data, this will be replaced with a real API call in the future
import { events as sampleEvents } from '../data/sampleData.js';
import { normalizeEvent } from '../utils/eventUtils.js';

export async function fetchEvents() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleEvents.map(normalizeEvent));
    }, 400);
  });
}

import { registrations as sampleRegistrations } from '../data/sampleData.js';

export async function fetchRegistrations() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...sampleRegistrations]);
    }, 400);
  });
}
