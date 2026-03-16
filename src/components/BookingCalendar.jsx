// ─────────────────────────────────────────────────────────────
// BookingCalendar.jsx
// Booking + religious calendar overlay (Hindu / Muslim / Christian).
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
import { useSelector } from "react-redux";
import {
  MONTH_ABBR, MONTH_FULL, DAY_LABELS,
  getDaysInMonth, getStartOffset, toDateKey, getAvailableYears,
} from "../utils/calendarUtils";
import { CalendarTabs } from "../pages/admin/calendar/CalendarTabs";
import { listCalendarDays } from "../api/calendar";
import { listConfirmedLeads } from "../api/leads";

// Computed once — never changes at runtime
const AVAILABLE_YEARS = getAvailableYears();
const TODAY = new Date();

// ── Religious calendar colors ─────────────────────────────────

const RELIGIOUS_COLORS = {
  most_auspicious: "#15803d",   // deep green
  auspicious: "#4ade80",        // light green
  less_auspicious: "#facc15",   // yellow
};

// ── CalendarDayCell ────────────────────────────────────────────
// Single clickable day circle.

const CalendarDayCell = memo(function CalendarDayCell({
  day,
  year,
  month,
  isBooked,
  religiousType,
  dateKey,
  onToggle, // kept for API compatibility, but ignored (read‑only calendar)
  isLocked = false,
}) {
  const isToday = TODAY.getFullYear() === year && TODAY.getMonth() === month && TODAY.getDate() === day;

  let bg = "transparent";
  let color = "#9a9896";
  let fw = 400;
  let border = "none";

  if (isBooked) {
    bg = "#e8875a";
    color = "#ffffff";
    fw = 700;
  } else if (religiousType && RELIGIOUS_COLORS[religiousType]) {
    bg = RELIGIOUS_COLORS[religiousType];
    color = religiousType === "less_auspicious" ? "#1a1917" : "#ffffff";
    fw = 600;
  } else if (isToday) {
    bg = "#ede8ff";
    color = "#7c6fcd";
    fw = 600;
    border = "1.5px solid #7c6fcd";
  }

  return (
    <button
      // Read-only: no tap / toggle behaviour
      aria-label={`${MONTH_FULL[month]} ${day}, ${year}`}
      style={{
        width: "100%",
        aspectRatio: "1",
        borderRadius: "50%",
        border,
        background: bg,
        color,
        fontWeight: fw,
        fontSize: "clamp(7px, 1.5vw, 9px)",
        fontFamily: "'DM Sans', sans-serif",
        cursor: "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        lineHeight: 1,
        transition: "background 0.15s, color 0.15s",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      // No hover interaction in read-only mode
    >
      {day}
    </button>
  );
});

// ── MonthGrid ──────────────────────────────────────────────────
// One month: name, M T W T F S S header, and date cells.

const MonthGrid = memo(function MonthGrid({ year, month, bookedDates, blockedDates, religiousByDate, onToggle }) {
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
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} aria-hidden="true" />;
          const key = toDateKey(year, month, day);
          const locked = blockedDates.has(key);
          return (
            <CalendarDayCell
              key={key}
              day={day}
              year={year}
              month={month}
              isBooked={bookedDates.has(key) || locked}
              religiousType={religiousByDate.get(key)}
              dateKey={key}
              onToggle={onToggle}
              isLocked={locked}
            />
          );
        })}
      </div>
    </div>
  );
});

// ── CalendarLegend ─────────────────────────────────────────────

function CalendarLegend() {
  const items = [
    { label: "Booked",           bg: "#e8875a", border: "none" },
    { label: "Today",            bg: "#ede8ff", border: "1.5px solid #7c6fcd" },
    { label: "Most auspicious",  bg: RELIGIOUS_COLORS.most_auspicious, border: "none" },
    { label: "Auspicious",       bg: RELIGIOUS_COLORS.auspicious, border: "none" },
    { label: "Less auspicious",  bg: RELIGIOUS_COLORS.less_auspicious, border: "none" },
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
  const { access_token: accessToken, venueId } = useSelector((state) => state.user.value);
  const [religion, setReligion] = useState("hindu");
  const [religiousByDate, setReligiousByDate] = useState(new Map());
  const [blockedDates, setBlockedDates] = useState(new Set());

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await listCalendarDays(accessToken, { religion, year });
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const map = new Map();
        for (const item of arr) {
          if (item?.date && item?.type) {
            map.set(item.date, item.type);
          }
        }
        if (!cancelled) {
          setReligiousByDate(map);
        }
      } catch (err) {
        // Non-blocking; booking calendar still works without religious overlay
        // eslint-disable-next-line no-console
        console.error("Failed to load religious calendar days", err);
        if (!cancelled) {
          setReligiousByDate(new Map());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, religion, year]);

  // Load confirmed leads and block their event date ranges on the calendar.
  useEffect(() => {
    if (!accessToken || !venueId) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await listConfirmedLeads(venueId, accessToken, { year });
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const set = new Set();
        for (const lead of arr) {
          const sd = lead?.specialDay;
          if (!sd?.startAt || !sd?.endAt) continue;
          const start = new Date(sd.startAt);
          const end = new Date(sd.endAt);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
          // Walk from start to end (inclusive), but only for this year.
          const cursor = new Date(start);
          while (cursor <= end) {
            if (cursor.getFullYear() === year) {
              const key = toDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
              set.add(key);
            }
            cursor.setDate(cursor.getDate() + 1);
          }
        }
        if (!cancelled) {
          setBlockedDates(set);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load confirmed leads for calendar", err);
        if (!cancelled) {
          setBlockedDates(new Set());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, venueId, year]);

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
          <p style={{ margin: "4px 0 4px", fontSize: "12px", color: "#9a9896", fontFamily: "'DM Sans', sans-serif" }}>
            Dates are auto-marked from confirmed leads and the religious calendar
          </p>
          <div style={{ marginTop: "4px" }}>
            <CalendarTabs value={religion} onChange={setReligion} />
          </div>
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
            blockedDates={blockedDates}
            religiousByDate={religiousByDate}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}