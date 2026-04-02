export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Day-of-month from an ISO date string (e.g. "2026-01-05T00:00:00.000Z" → 5) */
export function getEmiDay(emiDateStr) {
  return new Date(emiDateStr).getDate();
}

/**
 * Generate every month/year between start (inclusive) and end (inclusive).
 * Returns [{ month: 1-12, year: YYYY }, ...]
 */
export function generateEmiMonths(emiDateStr, endDateStr) {
  const start = new Date(emiDateStr);
  const end = new Date(endDateStr);
  const result = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endFirst = new Date(end.getFullYear(), end.getMonth(), 1);
  while (current <= endFirst) {
    result.push({ month: current.getMonth() + 1, year: current.getFullYear() });
    current.setMonth(current.getMonth() + 1);
  }
  return result;
}

/** Find a matching emiStatus entry for a specific month (1-12) + year */
export function findEmiStatus(emiStatusArr, month, year) {
  return (
    (emiStatusArr || []).find(
      (s) =>
        Number(s.month) === Number(month) && Number(s.year) === Number(year),
    ) || null
  );
}

/**
 * Compute display status for a given bill/month/year.
 * Returns { type: "paid"|"due_soon"|"overdue"|"upcoming", daysLeft?, daysOverdue?, status }
 */
export function getEmiMonthStatus(bill, month, year) {
  const status = findEmiStatus(bill.emiStatus, month, year);
  if (status?.paid) return { type: "paid", status };

  const emiDay = getEmiDay(bill.emiDate);
  const daysInMonth = new Date(year, month, 0).getDate(); // last day of that month
  const clampedDay = Math.min(emiDay, daysInMonth);

  const dueDate = new Date(year, month - 1, clampedDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return { type: "overdue", daysOverdue: Math.abs(diffDays), status };
  if (diffDays <= 10) return { type: "due_soon", daysLeft: diffDays, status };
  return { type: "upcoming", daysLeft: diffDays, status };
}

/** Format a number as Indian Rupee */
export function formatCurrency(amount) {
  if (amount == null) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

/** Format ISO date → "05 Jan 2026" */
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

/** e.g. formatMonthYear(4, 2026) → "April 2026" */
export function formatMonthYear(month, year) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}
