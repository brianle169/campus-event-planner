// reusable utility functions for event management

import { formatCategoryValue } from '../data/sampleData.js';
import { formatTime as formatTimeFromDateHelpers } from './dateHelpers.js';

export function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatTime(timeString) {
  return formatTimeFromDateHelpers(timeString);
}

export function getBadgeClass(status) {
  if (status === 'open') return 'badge-open';
  if (status === 'full') return 'badge-full';
  if (status === 'cancelled') return 'badge-cancelled';
  if (status === 'completed') return 'badge-completed';
  return '';
}

export function formatCategory(category) {
  return formatCategoryValue(category);
}

export function normalizeEvent(event = {}) {
  return {
    ...event,
    capacity: Number(event.capacity ?? 0),
    registrationCount: Number(event.registrationCount ?? event.registeredCount ?? 0),
  };
}
