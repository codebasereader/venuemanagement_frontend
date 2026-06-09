export const MONTH_FULL = [
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

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In progress" },
  { key: "confirmed", label: "Confirmed" },
  { key: "cancelled", label: "Cancelled" },
];

export function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getStartOffset(year, month) {
  return new Date(year, month, 1).getDay();
}

export function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatSpecialDayRange(specialDay) {
  const startAt = specialDay?.startAt;
  const endAt = specialDay?.endAt;
  if (!startAt && !endAt) return "Special day: —";
  const startLabel = startAt ? formatDate(startAt) : "—";
  const endLabel = endAt ? formatDate(endAt) : "—";
  return `Special day: ${startLabel} - ${endLabel}`;
}

export function niceEventType(lead) {
  const type = String(lead?.eventType || "").trim().toLowerCase();
  if (!type) return "—";
  if (type === "other") {
    return (lead?.eventTypeOther || "Other").trim() || "Other";
  }
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function eventStatusMeta(value) {
  const s = String(value || "").toLowerCase();
  if (s === "confirmed") return { label: "Confirmed", bg: "#dcfce7", color: "#166534", border: "#86efac" };
  if (s === "cancelled") return { label: "Cancelled", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
  if (s === "in_progress") return { label: "In progress", bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
  return { label: "—", bg: "#f3f4f6", color: "#4b5563", border: "#d1d5db" };
}

export function normalizeStatusFilter(status) {
  if (!status) return "";
  const value = String(status).trim().toLowerCase();
  if (value === "inprogress") return "in_progress";
  if (value === "conformed") return "confirmed";
  return value;
}

export function eventStatusLabel(status) {
  if (status === "in_progress") return "In progress";
  if (status === "confirmed") return "Confirmed";
  if (status === "cancelled") return "Cancelled";
  return "—";
}

export function getLeadDateRange(lead) {
  const startAt = lead?.specialDay?.startAt;
  const endAt = lead?.specialDay?.endAt;
  if (!startAt || !endAt) return null;
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return { start, end };
}

export function getLeadDaysForMonth(lead, year, month) {
  const range = getLeadDateRange(lead);
  if (!range) return [];
  const monthStart = new Date(year, month, 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(year, month, getDaysInMonth(year, month));
  monthEnd.setHours(0, 0, 0, 0);
  if (range.end < monthStart || range.start > monthEnd) return [];
  const cursor = new Date(range.start > monthStart ? range.start : monthStart);
  const stop = range.end < monthEnd ? range.end : monthEnd;
  const days = [];
  while (cursor <= stop) {
    days.push(toDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function parseLeadsResponse(data) {
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      totalPages: 1,
      limit: data.length || 10,
    };
  }

  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.docs)
        ? data.docs
        : [];

  const pagination = data?.pagination || {};
  const total = Number(data?.total ?? pagination.total ?? pagination.count ?? items.length) || 0;
  const page = Number(data?.page ?? pagination.page ?? pagination.currentPage ?? 1) || 1;
  const limit = Number(data?.limit ?? pagination.limit ?? pagination.perPage ?? 10) || 10;
  const totalPages =
    Number(data?.totalPages ?? pagination.totalPages ?? pagination.pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return { items, total, page, totalPages, limit };
}
