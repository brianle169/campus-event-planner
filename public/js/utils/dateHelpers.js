export const isUpcoming = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateStr}T00:00:00`) >= today;
};

export const formatDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export const formatTime = (timeStr) => {
  if (!timeStr) return '';

  const [hourStr = '0', minute = '0'] = timeStr.split(":");
  const hour24 = parseInt(hourStr, 10);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
};
