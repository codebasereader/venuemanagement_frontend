import React, { useMemo } from "react";
import {
  DAY_LABELS,
  MONTH_FULL,
  getDaysInMonth,
  getStartOffset,
  toDateKey,
} from "../../../utils/calendarUtils.js";

export const TABS = [
  { key: "all", label: "All" },
  { key: "venue_buyout", label: "Venue buyout" },
  { key: "space_buyout", label: "Space buyout" },
];

export function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ border: "none", cursor: "pointer", padding: "8px 14px", borderRadius: 999, fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 13, background: active ? "#1a1917" : "#f0ede8", color: active ? "white" : "#1a1917", transition: "background 0.15s, color 0.15s" }}
    >
      {label}
    </button>
  );
}

export function MonthlyGrid({ year, month, leadsByDate, onDayClick }) {
  const cells = useMemo(() => {
    const days = getDaysInMonth(year, month);
    const offset = getStartOffset(year, month);
    const arr = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {DAY_LABELS.map((lbl, idx) => (
          <div key={`day-head-${idx}-${lbl}`} style={{ fontSize: 11, fontWeight: 600, color: "#c5c2be", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
            {lbl}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;
          const key = toDateKey(year, month, day);
          const events = leadsByDate[key] || [];
          return (
            <div key={key} onClick={() => onDayClick?.(key)} style={{ border: "1px solid #ece9e4", borderRadius: 10, minHeight: 110, padding: 6, background: events.length ? "#fff7f2" : "#fff", cursor: "pointer", overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b6966", marginBottom: 4 }}>{day}</div>
              <div style={{ display: "grid", gap: 4 }}>
                {events.slice(0, 3).map((lead, index) => (
                  <div key={`${lead._id || lead.id}-${index}`} style={{ fontSize: 11, border: "1px solid #f5cdb9", background: "#ffe8db", color: "#66331f", borderRadius: 7, padding: "4px 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lead.contact?.name || "Lead"}
                  </div>
                ))}
                {events.length > 3 && <div style={{ fontSize: 11, color: "#9a9896", fontWeight: 700 }}>+{events.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function YearGrid({ year, leadsByDate, onDayClick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
      {MONTH_FULL.map((monthLabel, monthIdx) => {
        const days = getDaysInMonth(year, monthIdx);
        const offset = getStartOffset(year, monthIdx);
        const arr = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
        while (arr.length % 7 !== 0) arr.push(null);
        return (
          <div key={`${year}-${monthIdx}`} style={{ border: "1px solid #f1f0ee", borderRadius: 12, padding: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#1a1917", marginBottom: 8 }}>{monthLabel}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
              {DAY_LABELS.map((lbl, idx) => (
                <div key={`year-day-head-${monthIdx}-${idx}-${lbl}`} style={{ fontSize: 10, color: "#9a9896", textAlign: "center" }}>{lbl[0]}</div>
              ))}
              {arr.map((day, idx) => {
                if (day === null) return <div key={`y-empty-${monthIdx}-${idx}`} />;
                const dateKey = toDateKey(year, monthIdx, day);
                const hasEvents = (leadsByDate[dateKey] || []).length > 0;
                return (
                  <button key={dateKey} type="button" onClick={() => onDayClick?.(dateKey)} style={{ border: "none", borderRadius: 8, minHeight: 26, fontSize: 11, background: hasEvents ? "#e8875a" : "transparent", color: hasEvents ? "#fff" : "#6b6966", cursor: "pointer" }}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LeadDetailsDrawer({ isOpen, dateKey, leads, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1400 }} onClick={onClose}>
      <div
        style={{ position: "absolute", top: 0, right: 0, height: "100%", background: "white", borderLeft: "1px solid #ece9e4", padding: 20, width: "min(480px, 96vw)", boxShadow: "-12px 0 32px rgba(0,0,0,0.16)", overflowY: "auto", fontFamily: "'DM Sans', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#1a1917" }}>Bookings on {dateKey}</div>
            <div style={{ fontSize: 12, color: "#6b6966", marginTop: 2 }}>Confirmed leads with specialDay covering this date</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, border: "1px solid #e8e6e2", background: "#faf9f7", cursor: "pointer" }} aria-label="Close">✕</button>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
          {leads.map((lead) => {
            const sd = lead.specialDay || {};
            const start = sd.startAt ? new Date(sd.startAt).toLocaleString("en-IN") : "—";
            const end = sd.endAt ? new Date(sd.endAt).toLocaleString("en-IN") : "—";
            return (
              <div key={lead._id} style={{ borderRadius: 14, border: "1px solid #ece9e4", padding: 12, background: "#faf9f7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4, alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1917" }}>{lead.contact?.name || "Unnamed lead"}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 7px", borderRadius: 999, background: "#f0ede8", color: "#6b6966", textTransform: "uppercase" }}>
                    {lead.bookingType === "space_buyout" ? "Space" : "Venue"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#6b6966", marginBottom: 4 }}>{lead.eventType || "Event"} at {lead.venue?.name || "Venue"}</div>
                <div style={{ fontSize: 12, color: "#6b6966", marginBottom: 4 }}>{lead.contact?.phone}</div>
                <div style={{ fontSize: 12, color: "#44413d" }}>{start} – {end}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
