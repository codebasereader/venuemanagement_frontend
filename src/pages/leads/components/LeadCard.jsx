import React from "react";
import { eventStatusMeta, formatSpecialDayRange, niceEventType } from "../leadsHelpers.js";

const EyeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function LeadCard({ lead, onViewDetails, onDeleteClick, deleting }) {
  const name = lead?.contact?.name || lead?.clientName || "—";
  const phone = lead?.contact?.phone || lead?.phone || "—";
  const status = eventStatusMeta(lead?.eventStatus);
  const eventType = niceEventType(lead);
  const specialDayLabel = formatSpecialDayRange(lead?.specialDay);

  return (
    <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 10px", borderRadius: 999, border: `1px solid ${status.border}`, background: status.bg, color: status.color, fontSize: 11, fontWeight: 700, textTransform: "capitalize", lineHeight: 1.2 }}>
          {status.label}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 600, color: "#1a1917" }}>{name}</p>
        <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#6b6966" }}>{phone}</p>
        <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#6b6966", fontWeight: 600 }}>Event: {eventType}</p>
        <p style={{ margin: 0, fontSize: "13px", color: "#9a9896" }}>{specialDayLabel}</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onViewDetails(lead)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", borderRadius: "10px", border: "1px solid #e8e6e2", background: "#faf9f7", color: "#1a1917", fontSize: "14px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "background 0.15s, border-color 0.15s", flex: 1 }}
        >
          <EyeIcon />
          View details
        </button>
        <button
          type="button"
          onClick={() => onDeleteClick?.(lead)}
          disabled={deleting}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, borderRadius: 10, border: "1px solid #fecaca", background: "#fff1f2", color: "#b91c1c", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1 }}
          title="Delete lead"
          aria-label="Delete lead"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
