import React from "react";
import { eventStatusMeta, formatSpecialDayRange, niceEventType } from "../leadsHelpers.js";

export default function EventDetailsDrawer({ open, dateKey, events, onClose, onViewDetails }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: open ? "rgba(0,0,0,0.35)" : "transparent", pointerEvents: open ? "auto" : "none", zIndex: 1400, transition: "background 0.2s ease" }} onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: 0, right: 0, height: "100%", width: "min(480px, 96vw)", background: "#fff", transform: open ? "translateX(0)" : "translateX(102%)", transition: "transform 0.25s ease", borderLeft: "1px solid #ece9e4", boxShadow: "-12px 0 32px rgba(0,0,0,0.16)", padding: 18, overflowY: "auto", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#1a1917" }}>{dateKey || "Event details"}</div>
            <div style={{ fontSize: 12, color: "#6b6966" }}>Leads on selected date</div>
          </div>
          <button type="button" onClick={onClose} style={{ border: "1px solid #e8e6e2", borderRadius: 10, background: "#fff", width: 34, height: 34, cursor: "pointer" }}>
            ✕
          </button>
        </div>
        {events.length === 0 && <p style={{ margin: 0, fontSize: 14, color: "#6b6966" }}>No events found.</p>}
        <div style={{ display: "grid", gap: 10 }}>
          {events.map((lead) => {
            const status = eventStatusMeta(lead?.eventStatus);
            return (
              <div key={lead?._id || lead?.id} style={{ border: "1px solid #ece9e4", borderRadius: 12, padding: 12, background: "#faf9f7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong style={{ color: "#1a1917", fontSize: 14 }}>{lead?.contact?.name || lead?.clientName || "—"}</strong>
                  <span style={{ fontSize: 11, border: `1px solid ${status.border}`, background: status.bg, color: status.color, borderRadius: 999, padding: "2px 8px" }}>{status.label}</span>
                </div>
                <div style={{ fontSize: 12, color: "#6b6966", marginTop: 4 }}>{niceEventType(lead)}</div>
                <div style={{ fontSize: 12, color: "#6b6966", marginTop: 2 }}>{formatSpecialDayRange(lead?.specialDay)}</div>
                <button type="button" onClick={() => onViewDetails?.(lead)} style={{ marginTop: 10, border: "1px solid #d9d6d0", background: "#fff", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                  Open lead
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
