export function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatINR(amount) {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function formatDayLabel(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function capitalize(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getClientName(item) {
  return item.lead?.contact?.clientName || item.lead?.contact?.name || "—";
}

export function getEventType(item) {
  const t = item.lead?.eventType;
  if (!t) return "—";
  if (t === "other" && item.lead?.eventTypeOther) {
    return capitalize(item.lead.eventTypeOther);
  }
  return capitalize(t);
}

export function getPartyOrVendorName(item) {
  if (item.source === "commission") return item.vendorName || "—";
  if (item.source === "labour") {
    return item.labourName || item.vendorName || "—";
  }
  const parts = [item.receivedByName, item.givenByName].filter(Boolean);
  return parts.length ? parts.join(" / ") : "—";
}

export function getDaybookErrorMessage(error, fallback = "Failed to fetch daybook data") {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export const dateInputStyle = {
  minWidth: 180,
  padding: "9px 12px",
  border: "1px solid #d9d9d9",
  borderRadius: 8,
  fontSize: 14,
  color: "#1a1917",
  background: "#fff",
};
