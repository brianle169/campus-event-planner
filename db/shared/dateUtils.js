// Event dates are stored as plain local calendar dates ("YYYY-MM-DD") with
// no timezone attached, so anything comparing against "today" must use the
// server's local date too.
export function todayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
