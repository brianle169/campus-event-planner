// Mock a backend api call to fetch events data, this will be replaced with a real API call in the future
import mockEvents from '../data/mockEvents.js';

export async function fetchEvents() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEvents);
    }, 500);
  });
}
