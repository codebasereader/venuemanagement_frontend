// ─────────────────────────────────────────────────────────────
// Home.jsx  —  Dashboard home page
// Imports: BookingCalendar + calendarUtils (3 files total)
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BookingCalendar from "../components/BookingCalendar";
import { getAvailableYears, getGreeting } from "../utils/calendarUtils";
import { listConfirmedLeadStats } from "../api/leads";

// Computed once on load — stable across renders
const GREETING     = getGreeting();
const YEARS        = getAvailableYears();
const DEFAULT_YEAR = YEARS[YEARS.length - 1]; // most recent year

// ── Stat Card ─────────────────────────────────────────────────

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      flex: "1 1 90px",
      background: "white",
      borderRadius: "14px",
      padding: "16px 18px",
      border: "1px solid #f1f0ee",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <p style={{
        margin: "0 0 6px", fontSize: "11px", color: "#9a9896",
        fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {label}
      </p>
      <p style={{
        margin: 0,
        fontSize: "clamp(20px, 4vw, 26px)",
        fontWeight: 700,
        color,
        fontFamily: "'DM Serif Display', Georgia, serif",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{
          margin: "5px 0 0", fontSize: "11px", color: "#b5b3b0",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────

export default function Home() {
  const { access_token: token, venueId } = useSelector(
    (state) => state.user.value,
  );
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!token || !venueId) return;

    let cancelled = false;
    (async () => {
      setLoadingStats(true);
      try {
        const data = await listConfirmedLeadStats(venueId, token, {
          year,
        });
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, venueId, year]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "clamp(16px, 3vw, 24px)",
      maxWidth: "960px",
      width: "100%",
    }}>

      {/* ── Page header ── */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "13px", color: "#9a9896", fontFamily: "'DM Sans', sans-serif" }}>
            {GREETING}
          </p>
          <h1 style={{
            margin: "2px 0 0",
            fontSize: "clamp(22px, 5vw, 28px)",
            fontWeight: 700,
            color: "#1a1917",
            fontFamily: "'DM Serif Display', Georgia, serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            Dashboard
          </h1>
        </div>

        <button
          aria-label="Settings"
          style={{
            width: "36px", height: "36px", background: "#f0ede8",
            border: "none", borderRadius: "10px", display: "flex",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e4de")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f0ede8")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#6b6966" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        </button>
      </header>

      {/* ── Stats strip (API-driven) ── */}
      <div role="region" aria-label="Booking statistics" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <StatCard
          label="Total bookings"
          value={stats?.totalBookings ?? (loadingStats ? "…" : 0)}
          color="#e8875a"
          sub={`Year ${year}`}
        />
        <StatCard
          label="Revenue"
          value={
            stats
              ? `₹${(stats.totalRevenue ?? 0).toLocaleString("en-IN")}`
              : loadingStats
                ? "…"
                : "₹0"
          }
          color="#5ab99c"
          sub="Confirmed in year"
        />
        <StatCard
          label="Event days"
          value={stats?.totalEventDays ?? (loadingStats ? "…" : 0)}
          color="#7c6fcd"
        />
        <StatCard
          label="Occupancy"
          value={
            stats?.occupancyPercent != null
              ? `${stats.occupancyPercent.toFixed(1)}%`
              : loadingStats
                ? "…"
                : "0.0%"
          }
          color="#c9a84c"
        />
      </div>

      {/* ── Full-year booking calendar ── */}
      <BookingCalendar
        year={year}
        onYearChange={setYear}
        bookedDates={new Set()}
        onToggle={() => {}}
      />

    </div>
  );
}