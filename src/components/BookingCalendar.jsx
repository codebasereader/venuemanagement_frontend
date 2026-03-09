// ─────────────────────────────────────────────────────────────
// BookingCalendar.jsx
// Self-contained calendar feature — all sub-components live here.
//
// Default export: <BookingCalendar /> — drop into any page.
//
// Props:
//   year         number                  currently displayed year
//   onYearChange (year: number) => void  called when user picks a year
//   bookedDates  Set<string>             set of "YYYY-MM-DD" keys
//   onToggle     (key: string) => void   called when a day is clicked
// ─────────────────────────────────────────────────────────────

import { memo, useMemo, useState, useRef, useEffect } from "react";
import {
  MONTH_ABBR, MONTH_FULL, DAY_LABELS,
  getDaysInMonth, getStartOffset, toDateKey, getAvailableYears,
} from "../utils/calendarUtils";

// Computed once — never changes at runtime
const AVAILABLE_YEARS = getAvailableYears();
const TODAY = new Date();

// ── CalendarDayCell ────────────────────────────────────────────
// Single clickable day circle.

const CalendarDayCell = memo(function CalendarDayCell({ day, year, month, isBooked, dateKey, onToggle }) {
  const isToday = TODAY.getFullYear() === year && TODAY.getMonth() === month && TODAY.getDate() === day;

  const bg    = isBooked ? "#e8875a" : isToday ? "#ede8ff" : "transparent";
  const color = isBooked ? "#ffffff" : isToday  ? "#7c6fcd"  : "#9a9896";
  const fw    = isBooked ? 700       : isToday  ? 600        : 400;

  return (
    <button
      onClick={() => onToggle(dateKey)}
      aria-label={`${isBooked ? "Unbook" : "Book"} ${MONTH_FULL[month]} ${day}, ${year}`}
      aria-pressed={isBooked}
      style={{
        width: "100%",
        aspectRatio: "1",
        borderRadius: "50%",
        border: isToday && !isBooked ? "1.5px solid #7c6fcd" : "none",
        background: bg,
        color,
        fontWeight: fw,
        fontSize: "clamp(7px, 1.5vw, 9px)",
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        lineHeight: 1,
        transition: "background 0.15s, color 0.15s",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      onMouseEnter={(e) => { if (!isBooked) e.currentTarget.style.background = "#f0ede8"; }}
      onMouseLeave={(e) => { if (!isBooked) e.currentTarget.style.background = isToday ? "#ede8ff" : "transparent"; }}
    >
      {day}
    </button>
  );
});

// ── MonthGrid ──────────────────────────────────────────────────
// One month: name, M T W T F S S header, and date cells.

const MonthGrid = memo(function MonthGrid({ year, month, bookedDates, onToggle }) {
  const cells = useMemo(() => {
    const days   = getDaysInMonth(year, month);
    const offset = getStartOffset(year, month);
    const arr    = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (arr.length % 7 !== 0) arr.push(null); // complete last row
    return arr;
  }, [year, month]);

  return (
    <div style={{ minWidth: 0 }}>
      {/* Month name */}
      <p style={{
        margin: "0 0 5px",
        fontSize: "11px",
        fontWeight: 700,
        color: "#1a1917",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {MONTH_ABBR[month]}
      </p>

      {/* Day-of-week labels: M T W T F S S */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "2px" }}>
        {DAY_LABELS.map((lbl, i) => (
          <div key={i} aria-hidden="true" style={{
            fontSize: "clamp(6px, 1.1vw, 8px)",
            fontWeight: 600,
            color: "#c5c2be",
            textAlign: "center",
            lineHeight: "1.8",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {lbl}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px" }}>
        {cells.map((day, i) =>
          day === null
            ? <div key={`e-${i}`} aria-hidden="true" />
            : <CalendarDayCell
                key={day}
                day={day}
                year={year}
                month={month}
                isBooked={bookedDates.has(toDateKey(year, month, day))}
                dateKey={toDateKey(year, month, day)}
                onToggle={onToggle}
              />
        )}
      </div>
    </div>
  );
});

// ── CalendarLegend ─────────────────────────────────────────────

function CalendarLegend() {
  const items = [
    { label: "Free",   bg: "#e8e5e0", border: "none" },
    { label: "Booked", bg: "#e8875a", border: "none" },
    { label: "Today",  bg: "#ede8ff", border: "1.5px solid #7c6fcd" },
  ];
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
      {items.map(({ label, bg, border }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span aria-hidden="true" style={{
            display: "inline-block", width: "10px", height: "10px",
            borderRadius: "50%", background: bg, border, flexShrink: 0,
          }} />
          <span style={{ fontSize: "12px", color: "#9a9896", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── YearSelector ───────────────────────────────────────────────
// Accessible dropdown. Keyboard (Escape) + outside-click aware.

function YearSelector({ year, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey  = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown",   onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  // Single year — no need for a dropdown
  if (AVAILABLE_YEARS.length <= 1) {
    return (
      <span style={{
        fontSize: "13px", fontWeight: 700, color: "#1a1917",
        background: "#f5f4f1", borderRadius: "10px", padding: "8px 14px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {year}
      </span>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Year: ${year}`}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "white", border: "1px solid #e8e6e2",
          borderRadius: "10px", padding: "8px 14px",
          fontSize: "13px", fontWeight: 700, color: "#1a1917",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {year}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul role="listbox" aria-label="Select year" style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "white", border: "1px solid #e8e6e2",
          borderRadius: "12px", overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          zIndex: 100, minWidth: "110px",
          listStyle: "none", margin: 0, padding: "4px",
          maxHeight: "200px", overflowY: "auto",
        }}>
          {AVAILABLE_YEARS.map((y) => (
            <li key={y} role="option" aria-selected={y === year}>
              <button
                onClick={() => { onChange(y); setOpen(false); }}
                style={{
                  display: "block", width: "100%", padding: "9px 14px",
                  textAlign: "left", border: "none", borderRadius: "8px",
                  cursor: "pointer", fontSize: "13px",
                  fontWeight: y === year ? 700 : 500,
                  color:      y === year ? "#7c6fcd" : "#1a1917",
                  background: y === year ? "#f5f4f1" : "transparent",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => { if (y !== year) e.currentTarget.style.background = "#faf9f7"; }}
                onMouseLeave={(e) => { if (y !== year) e.currentTarget.style.background = "transparent"; }}
              >
                {y}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── BookingCalendar (default export) ──────────────────────────
// Fully controlled. Parent owns year + bookedDates state.
// Responsive: auto-fill from 1 col (mobile) to 4 cols (desktop).

export default function BookingCalendar({ year, onYearChange, bookedDates, onToggle }) {
  return (
    <section aria-label={`Booking calendar ${year}`} style={{
      background: "white",
      borderRadius: "20px",
      padding: "clamp(16px, 4vw, 28px)",
      border: "1px solid #f1f0ee",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "16px",
        gap: "12px", flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1917",
            fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "-0.01em",
          }}>
            Booking Calendar
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9a9896", fontFamily: "'DM Sans', sans-serif" }}>
            Tap any date to mark as booked
          </p>
        </div>
        <YearSelector year={year} onChange={onYearChange} />
      </div>

      <CalendarLegend />

      {/* 12 month grids — responsive columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "clamp(16px, 3vw, 28px) clamp(10px, 2vw, 20px)",
      }}>
        {Array.from({ length: 12 }, (_, m) => (
          <MonthGrid
            key={`${year}-${m}`}
            year={year}
            month={m}
            bookedDates={bookedDates}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}