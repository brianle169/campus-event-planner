// reusable utility functions for event management

export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function getBadgeClass(status) {
  if (status === 'open') return 'badge-open';
  if (status === 'full') return 'badge-full';
  if (status === 'cancelled') return 'badge-cancelled';
  if (status === 'completed') return 'badge-completed';
  return '';
}
