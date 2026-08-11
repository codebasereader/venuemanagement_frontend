// ─────────────────────────────────────────────────────────────
// BookingCalendar.jsx
// Year booking calendar with confirmed / in-progress overlays
// and optional Christian / Muslim / Hindu days.
//
// Default export: <BookingCalendar /> — drop into any page.
//
// Props:
//   year         number                  currently displayed year
//   onYearChange (year: number) => void  called when user picks a year
//   bookedDates  (unused; kept for backward compatibility)
//   onToggle     (unused; kept for backward compatibility)
// ─────────────────────────────────────────────────────────────

import { memo, useMemo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  MONTH_ABBR, MONTH_FULL, DAY_LABELS,
  getDaysInMonth, getStartOffset, toDateKey, getAvailableYears,
} from "../utils/calendarUtils";
import { listCalendarDays } from "../api/calendar";

// Computed once — never changes at runtime
const AVAILABLE_YEARS = getAvailableYears();
const TODAY = new Date();
const EMPTY_MAP = new Map();

// ── Colors ─────────────────────────────────────────────────────

const CONFIRMED_COLOR = "#1a1917";   // black — confirmed bookings
const IN_PROGRESS_COLOR = "#facc15"; // yellow — in-progress bookings

const RELIGION_VIEW_COLORS = {
  christian: "#dc2626",
  muslim: "#16a34a",
  hindu: "#ea580c",
};

const FAITH_GRADIENT_ORDER = ["christian", "muslim", "hindu"];

function formatBookingDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "numeric", month: "short",
    hour: "numeric", minute: "2-digit",
  });
}

function formatEventType(booking) {
  const t = booking?.eventType === "other" && booking?.eventTypeOther
    ? booking.eventTypeOther
    : booking?.eventType;
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function formatEventStatus(status) {
  if (!status) return "";
  return String(status).replace(/_/g, " ");
}

/** Build a solid color or conic-gradient from an ordered list of hex colors. */
function slicesBackground(colors) {
  const unique = [...new Set(colors.filter(Boolean))];
  if (unique.length === 0) return null;
  if (unique.length === 1) return unique[0];
  const step = 360 / unique.length;
  const stops = unique
    .map((c, i) => {
      const start = i * step;
      const end = (i + 1) * step;
      return `${c} ${start}deg ${end}deg`;
    })
    .join(", ");
  return `conic-gradient(from 0deg, ${stops})`;
}

function faithColors(religions) {
  if (!Array.isArray(religions) || !religions.length) return [];
  const unique = [...new Set(religions.filter((r) => RELIGION_VIEW_COLORS[r]))];
  return [...unique]
    .sort((a, b) => FAITH_GRADIENT_ORDER.indexOf(a) - FAITH_GRADIENT_ORDER.indexOf(b))
    .map((r) => RELIGION_VIEW_COLORS[r]);
}

/**
 * Resolve day cell fill from bookings + optional faiths.
 * Overlaps (confirmed + in_progress + faiths) share the circle via conic slices.
 */
function resolveDayStyle(bookings, religiousEntry, isToday) {
  const list = Array.isArray(bookings) ? bookings : [];
  const hasConfirmed = list.some((b) => b?.eventStatus === "confirmed");
  const hasInProgress = list.some((b) => b?.eventStatus === "in_progress");

  const faith =
    religiousEntry &&
    typeof religiousEntry === "object" &&
    religiousEntry.mode === "faith" &&
    Array.isArray(religiousEntry.religions)
      ? religiousEntry.religions
      : [];

  const colors = [];
  if (hasConfirmed) colors.push(CONFIRMED_COLOR);
  if (hasInProgress) colors.push(IN_PROGRESS_COLOR);
  colors.push(...faithColors(faith));

  const bg = slicesBackground(colors);
  if (bg) {
    const onlyYellow =
      colors.length === 1 && colors[0] === IN_PROGRESS_COLOR;
    return {
      bg,
      color: onlyYellow ? "#1a1917" : "#ffffff",
      fw: 600,
      border: "none",
      hasBooking: list.length > 0,
    };
  }

  if (isToday) {
    return {
      bg: "#ede8ff",
      color: "#7c6fcd",
      fw: 600,
      border: "1.5px solid #7c6fcd",
      hasBooking: false,
    };
  }

  return {
    bg: "transparent",
    color: "#9a9896",
    fw: 400,
    border: "none",
    hasBooking: false,
  };
}

// ── CalendarDayCell ────────────────────────────────────────────

const CalendarDayCell = memo(function CalendarDayCell({
  day,
  year,
  month,
  religiousEntry,
  bookings,
}) {
  const [hovered, setHovered] = useState(false);
  const isToday =
    TODAY.getFullYear() === year &&
    TODAY.getMonth() === month &&
    TODAY.getDate() === day;

  const { bg, color, fw, border, hasBooking } = resolveDayStyle(
    bookings,
    religiousEntry,
    isToday,
  );

  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <button
        aria-label={`${MONTH_FULL[month]} ${day}, ${year}${hasBooking ? " — booking" : ""}`}
        onMouseEnter={hasBooking ? () => setHovered(true) : undefined}
        onMouseLeave={hasBooking ? () => setHovered(false) : undefined}
        onFocus={hasBooking ? () => setHovered(true) : undefined}
        onBlur={hasBooking ? () => setHovered(false) : undefined}
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
          cursor: hasBooking ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          lineHeight: 1,
          transition: "background 0.15s, color 0.15s",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <span>{day}</span>
        </div>
      </button>

      {hasBooking && hovered && <BookingTooltip bookings={bookings} />}
    </div>
  );
});

// ── BookingTooltip ─────────────────────────────────────────────

function BookingTooltip({ bookings }) {
  return (
    <div
      role="tooltip"
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1a1917",
        color: "#ffffff",
        borderRadius: "10px",
        padding: "10px 12px",
        minWidth: "180px",
        maxWidth: "240px",
        zIndex: 200,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        fontFamily: "'DM Sans', sans-serif",
        pointerEvents: "none",
      }}
    >
      {bookings.map((b, i) => {
        const name = b?.contact?.clientName || b?.contact?.name || "Booking";
        const eventType = formatEventType(b);
        const status = formatEventStatus(b?.eventStatus);
        const start = formatBookingDateTime(b?.specialDay?.startAt);
        const end = formatBookingDateTime(b?.specialDay?.endAt);
        const statusColor =
          b?.eventStatus === "in_progress"
            ? IN_PROGRESS_COLOR
            : b?.eventStatus === "confirmed"
              ? "#ffffff"
              : "#c5c2be";
        return (
          <div
            key={b?._id || i}
            style={{
              paddingTop: i === 0 ? 0 : 8,
              marginTop: i === 0 ? 0 : 8,
              borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, lineHeight: 1.3 }}>
              {name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#c5c2be" }}>
              {[eventType, b?.referenceCode].filter(Boolean).join(" · ")}
              {status ? (
                <>
                  {(eventType || b?.referenceCode) ? " · " : ""}
                  <span style={{ fontWeight: 600, color: statusColor }}>{status}</span>
                </>
              ) : null}
            </p>
            {(start || end) && (
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#c5c2be" }}>
                {start}{end ? ` – ${end}` : ""}
              </p>
            )}
            {b?.expectedGuests != null && (
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#c5c2be" }}>
                {b.expectedGuests} guests
              </p>
            )}
          </div>
        );
      })}

      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid #1a1917",
        }}
      />
    </div>
  );
}

// ── MonthGrid ──────────────────────────────────────────────────

const MonthGrid = memo(function MonthGrid({ year, month, religiousByDate, bookingsByDate }) {
  const cells = useMemo(() => {
    const days = getDaysInMonth(year, month);
    const offset = getStartOffset(year, month);
    const arr = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  return (
    <div style={{ minWidth: 0 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px" }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} aria-hidden="true" />;
          const key = toDateKey(year, month, day);
          return (
            <CalendarDayCell
              key={key}
              day={day}
              year={year}
              month={month}
              religiousEntry={religiousByDate.get(key)}
              bookings={bookingsByDate.get(key)}
            />
          );
        })}
      </div>
    </div>
  );
});

// ── CalendarLegend ─────────────────────────────────────────────

function CalendarLegend({ showFaiths, showConfirmed, showInProgress }) {
  const items = [
    { key: "today", label: "Today", bg: "#ede8ff", border: "1.5px solid #7c6fcd" },
    ...(showConfirmed
      ? [{ key: "confirmed", label: "Confirmed", bg: CONFIRMED_COLOR, border: "none" }]
      : []),
    ...(showInProgress
      ? [{ key: "in_progress", label: "In progress", bg: IN_PROGRESS_COLOR, border: "none" }]
      : []),
    ...(showFaiths
      ? [
          { key: "christian", label: "Christian", bg: RELIGION_VIEW_COLORS.christian, border: "none" },
          { key: "muslim", label: "Muslim", bg: RELIGION_VIEW_COLORS.muslim, border: "none" },
          { key: "hindu", label: "Hindu", bg: RELIGION_VIEW_COLORS.hindu, border: "none" },
        ]
      : []),
  ];
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
      {items.map(({ key, label, bg, border }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: bg,
              border,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "12px", color: "#9a9896", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── OverlayToggle ──────────────────────────────────────────────

function OverlayToggle({ on, onChange, label, ariaLabel, activeColor = "#1a1917" }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={ariaLabel || label}
        onClick={() => onChange(!on)}
        style={{
          position: "relative",
          width: 40,
          height: 22,
          borderRadius: 999,
          border: "none",
          padding: 0,
          background: on ? activeColor : "#e8e6e2",
          cursor: "pointer",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 3,
            left: on ? 20 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </button>
      <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b6966", lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  );
}

// ── YearSelector ───────────────────────────────────────────────

function YearSelector({ year, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
                  color: y === year ? "#7c6fcd" : "#1a1917",
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

export default function BookingCalendar({ year, onYearChange }) {
  const { access_token: accessToken } = useSelector((state) => state.user.value);
  const [showFaiths, setShowFaiths] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(true);
  const [showInProgress, setShowInProgress] = useState(true);
  const [religiousByDate, setReligiousByDate] = useState(new Map());
  const [bookingsByDate, setBookingsByDate] = useState(new Map());

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await listCalendarDays(accessToken, { religion: "all", year });
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.days)
            ? data.days
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const byDate = new Map();
        for (const item of arr) {
          if (!item?.date || !item?.religion) continue;
          const r = String(item.religion).toLowerCase();
          if (!RELIGION_VIEW_COLORS[r]) continue;
          if (!byDate.has(item.date)) byDate.set(item.date, new Set());
          byDate.get(item.date).add(r);
        }
        const map = new Map();
        for (const [dateKey, set] of byDate) {
          map.set(dateKey, { mode: "faith", religions: [...set] });
        }

        const bookingItems = Array.isArray(data?.bookings?.items) ? data.bookings.items : [];
        const bookingsMap = new Map();
        for (const booking of bookingItems) {
          const status = booking?.eventStatus;
          if (status !== "confirmed" && status !== "in_progress") continue;

          const start = booking?.specialDay?.startAt ? new Date(booking.specialDay.startAt) : null;
          const end = booking?.specialDay?.endAt ? new Date(booking.specialDay.endAt) : null;
          if (!start || Number.isNaN(start.getTime())) continue;
          const last = end && !Number.isNaN(end.getTime()) ? end : start;
          const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
          while (cursor <= lastDay) {
            const key = toDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
            if (!bookingsMap.has(key)) bookingsMap.set(key, []);
            bookingsMap.get(key).push(booking);
            cursor.setDate(cursor.getDate() + 1);
          }
        }

        if (!cancelled) {
          setReligiousByDate(map);
          setBookingsByDate(bookingsMap);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load religious calendar days", err);
        if (!cancelled) {
          setReligiousByDate(new Map());
          setBookingsByDate(new Map());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, year]);

  const visibleReligiousByDate = showFaiths ? religiousByDate : EMPTY_MAP;

  const visibleBookingsByDate = useMemo(() => {
    if (!showConfirmed && !showInProgress) return EMPTY_MAP;
    const map = new Map();
    for (const [key, list] of bookingsByDate) {
      const filtered = list.filter((b) => {
        if (b?.eventStatus === "confirmed") return showConfirmed;
        if (b?.eventStatus === "in_progress") return showInProgress;
        return false;
      });
      if (filtered.length) map.set(key, filtered);
    }
    return map;
  }, [bookingsByDate, showConfirmed, showInProgress]);

  return (
    <section aria-label={`Booking calendar ${year}`} style={{
      background: "white",
      borderRadius: "20px",
      padding: "clamp(16px, 4vw, 28px)",
      border: "1px solid #f1f0ee",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
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
          <p style={{ margin: "4px 0 10px", fontSize: "12px", color: "#9a9896", fontFamily: "'DM Sans', sans-serif" }}>
            Confirmed and in-progress special days; toggle faiths for auspicious overlay
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 20px" }}>
            <OverlayToggle
              on={showConfirmed}
              onChange={setShowConfirmed}
              label="Confirmed"
              ariaLabel="Show confirmed bookings"
              activeColor={CONFIRMED_COLOR}
            />
            <OverlayToggle
              on={showInProgress}
              onChange={setShowInProgress}
              label="In progress"
              ariaLabel="Show in-progress bookings"
              activeColor="#ca8a04"
            />
            <OverlayToggle
              on={showFaiths}
              onChange={setShowFaiths}
              label="Christian · Muslim · Hindu"
              ariaLabel="Show Christian, Muslim, and Hindu days"
            />
          </div>
        </div>
        <YearSelector year={year} onChange={onYearChange} />
      </div>

      <CalendarLegend
        showFaiths={showFaiths}
        showConfirmed={showConfirmed}
        showInProgress={showInProgress}
      />

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
            religiousByDate={visibleReligiousByDate}
            bookingsByDate={visibleBookingsByDate}
          />
        ))}
      </div>
    </section>
  );
}
