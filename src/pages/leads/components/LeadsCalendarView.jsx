import React, { useMemo } from "react";
import {
  DAY_LABELS,
  MONTH_FULL,
  eventStatusLabel,
  eventStatusMeta,
  getDaysInMonth,
  getStartOffset,
  normalizeStatusFilter,
  toDateKey,
} from "../leadsHelpers.js";

function YearGrid({ year, leadsByDate, onDayClick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
      {MONTH_FULL.map((monthLabel, monthIdx) => {
        const days = getDaysInMonth(year, monthIdx);
        const offset = getStartOffset(year, monthIdx);
        const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
        while (cells.length % 7 !== 0) cells.push(null);
        return (
          <div key={`${year}-${monthIdx}`} style={{ border: "1px solid #f1f0ee", background: "#fff", borderRadius: 14, padding: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#1a1917" }}>{monthLabel}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {DAY_LABELS.map((lbl) => (
                <div key={`${monthIdx}-${lbl}`} style={{ fontSize: 10, color: "#9a9896", textAlign: "center" }}>{lbl[0]}</div>
              ))}
              {cells.map((day, idx) => {
                if (day === null) return <div key={`blank-${monthIdx}-${idx}`} />;
                const dateKey = toDateKey(year, monthIdx, day);
                const events = leadsByDate[dateKey] || [];
                const isEventDay = events.length > 0;
                const primaryStatusMeta = isEventDay
                  ? eventStatusMeta(normalizeStatusFilter(events[0]?.eventStatus))
                  : null;
                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => onDayClick?.(dateKey)}
                    style={{
                      border: isEventDay ? `1px solid ${primaryStatusMeta.border}` : "none",
                      borderRadius: 8,
                      minHeight: 26,
                      fontSize: 11,
                      background: isEventDay ? primaryStatusMeta.bg : "transparent",
                      color: isEventDay ? primaryStatusMeta.color : "#6b6966",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  >
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

export default function LeadsCalendarView({
  calendarMode,
  setCalendarMode,
  calendarMonth,
  setCalendarMonth,
  calendarYear,
  setCalendarYear,
  leadsByDate,
  onDayClick,
}) {
  const now = new Date();
  const monthCells = useMemo(() => {
    const days = getDaysInMonth(calendarYear, calendarMonth);
    const offset = getStartOffset(calendarYear, calendarMonth);
    const arr = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [calendarYear, calendarMonth]);

  return (
    <div style={{ border: "1px solid #ece9e4", background: "#fff", borderRadius: 16, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "inline-flex", border: "1px solid #e8e6e2", borderRadius: 10, overflow: "hidden" }}>
          <button type="button" onClick={() => setCalendarMode("month")} style={{ border: "none", padding: "8px 12px", background: calendarMode === "month" ? "#1a1917" : "#fff", color: calendarMode === "month" ? "#fff" : "#1a1917", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Monthly</button>
          <button type="button" onClick={() => setCalendarMode("year")} style={{ border: "none", padding: "8px 12px", background: calendarMode === "year" ? "#1a1917" : "#fff", color: calendarMode === "year" ? "#fff" : "#1a1917", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Yearly</button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {calendarMode === "month" && (
            <select value={calendarMonth} onChange={(e) => setCalendarMonth(Number(e.target.value))} style={{ border: "1px solid #e8e6e2", borderRadius: 10, padding: "8px 10px", minWidth: 130 }}>
              {MONTH_FULL.map((monthName, idx) => (
                <option key={monthName} value={idx}>{monthName}</option>
              ))}
            </select>
          )}
          <select value={calendarYear} onChange={(e) => setCalendarYear(Number(e.target.value))} style={{ border: "1px solid #e8e6e2", borderRadius: 10, padding: "8px 10px", minWidth: 96 }}>
            {Array.from({ length: 16 }, (_, i) => now.getFullYear() - 5 + i).map((yearOption) => (
              <option key={yearOption} value={yearOption}>{yearOption}</option>
            ))}
          </select>
        </div>
      </div>

      {calendarMode === "month" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6, gap: 8 }}>
            {DAY_LABELS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 12, color: "#9a9896", fontWeight: 700 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
            {monthCells.map((day, idx) => {
              if (!day) return <div key={`m-empty-${idx}`} style={{ minHeight: 94 }} />;
              const dateKey = toDateKey(calendarYear, calendarMonth, day);
              const events = leadsByDate[dateKey] || [];
              return (
                <div key={dateKey} onClick={() => onDayClick(dateKey)} style={{ minHeight: 94, border: "1px solid #ece9e4", borderRadius: 10, padding: 6, background: events.length ? "#fff7f2" : "#fff", cursor: "pointer", overflow: "hidden" }}>
                  <div style={{ fontSize: 12, color: "#6b6966", fontWeight: 700, marginBottom: 4 }}>{day}</div>
                  <div style={{ display: "grid", gap: 4 }}>
                    {events.slice(0, 3).map((ev, cardIdx) => (
                      (() => {
                        const normalized = normalizeStatusFilter(ev?.eventStatus);
                        const statusMeta = eventStatusMeta(normalized);
                        return (
                          <div
                            key={`${ev?._id || ev?.id}-${cardIdx}`}
                            style={{
                              fontSize: 11,
                              lineHeight: 1.2,
                              padding: "4px 6px",
                              borderRadius: 7,
                              border: `1px solid ${statusMeta.border}`,
                              background: statusMeta.bg,
                              color: statusMeta.color,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {ev?.contact?.name || ev?.clientName || "Lead"} · {eventStatusLabel(normalized)}
                          </div>
                        );
                      })()
                    ))}
                    {events.length > 3 && <div style={{ fontSize: 11, color: "#9a9896", fontWeight: 700 }}>+{events.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calendarMode === "year" && <YearGrid year={calendarYear} leadsByDate={leadsByDate} onDayClick={onDayClick} />}
    </div>
  );
}
