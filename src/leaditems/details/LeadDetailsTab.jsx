import React from "react";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function niceEventType(lead) {
  const type = lead?.eventType || "";
  if (type === "other") return (lead?.eventTypeOther || "Other").toUpperCase();
  return String(type || "—").toUpperCase();
}

function niceRole(role) {
  if (!role) return "—";
  return String(role).toLowerCase();
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "10px 0" }}>
      <div style={{ color: "#6b6966", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
      <div style={{ color: "#1a1917", fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", textAlign: "right" }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #ece9e4",
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: "#1a1917",
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ borderTop: "1px solid #f1f0ee" }} />
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
}

const editBtnStyle = {
  padding: "8px 14px",
  borderRadius: 12,
  border: "1px solid #d4cfc4",
  background: "#f5f3ef",
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

export default function LeadDetailsTab({ lead, onEditClick }) {
  const startAt = lead?.specialDay?.startAt || null;
  const endAt = lead?.specialDay?.endAt || null;
  const durationHours = lead?.specialDay?.durationHours ?? "—";

  const startDate = startAt ? formatDate(startAt) : "—";
  const endDate = endAt ? formatDate(endAt) : "—";
  const startTime = startAt ? formatTime(startAt) : "—";
  const endTime = endAt ? formatTime(endAt) : "—";

  const sourceValue = lead?.createdByUser?.name
    ? `${lead.createdByUser.name} - ${niceRole(lead.createdByUser.role)}`
    : "—";

  const referenceCode =
    lead?.referenceCode || lead?.reference || lead?.metadata?.referenceCode || "—";
  const createdAt = formatDate(lead?.createdAt);

  const contactName = lead?.contact?.name ?? "—";
  const contactPhone = lead?.contact?.phone ?? "—";
  const contactAltPhone = lead?.contact?.altPhone;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            style={editBtnStyle}
          >
            Edit lead
          </button>
        )}
      </div>

      <Card title="Personal details">
        <InfoRow label="Name" value={contactName} />
        <div style={{ borderTop: "1px solid #f1f0ee" }} />
        <InfoRow label="Phone" value={contactPhone} />
        {contactAltPhone != null && String(contactAltPhone).trim() !== "" && (
          <>
            <div style={{ borderTop: "1px solid #f1f0ee" }} />
            <InfoRow label="Alternative phone" value={contactAltPhone} />
          </>
        )}
      </Card>

      <Card title="Event">
        <InfoRow label="Event Type" value={niceEventType(lead)} />
        <div style={{ borderTop: "1px solid #f1f0ee" }} />
        <InfoRow label="Start Date" value={`${startDate} • ${startTime}`} />
        <div style={{ borderTop: "1px solid #f1f0ee" }} />
        <InfoRow label="End Date" value={`${endDate} • ${endTime}`} />
        <div style={{ borderTop: "1px solid #f1f0ee" }} />
        <InfoRow label="Duration" value={durationHours !== "—" ? `${durationHours} hours` : "—"} />
        <div style={{ borderTop: "1px solid #f1f0ee" }} />
        <InfoRow label="Guest Count" value={lead?.expectedGuests ?? "—"} />
      </Card>

      <Card title="System Information">
        <InfoRow label="Source" value={sourceValue} />
        <div style={{ borderTop: "1px solid #f1f0ee" }} />
        <InfoRow label="Reference Code" value={referenceCode} />
        <div style={{ borderTop: "1px solid #f1f0ee" }} />
        <InfoRow label="Created" value={createdAt} />
      </Card>
    </div>
  );
}

