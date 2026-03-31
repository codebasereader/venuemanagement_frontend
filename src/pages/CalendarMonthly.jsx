import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { listConfirmedLeads, listConfirmedLeadStats } from "../api/leads.js";
import {
  MONTH_FULL,
  DAY_LABELS,
  getDaysInMonth,
  getStartOffset,
  toDateKey,
} from "../utils/calendarUtils.js";

const TABS = [
  { key: "all", label: "All" },
  { key: "venue_buyout", label: "Venue buyout" },
  { key: "space_buyout", label: "Space buyout" },
];

function TabButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        cursor: "pointer",
        padding: "8px 14px",
        borderRadius: 999,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 800,
        fontSize: 13,
        background: active ? "#1a1917" : "#f0ede8",
        color: active ? "white" : "#1a1917",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function MonthSelector({ year, month, onChange }) {
  const months = MONTH_FULL.map((label, idx) => ({ label, idx }));
  const handlePrev = () => {
    const prev = new Date(year, month - 1, 1);
    onChange({ year: prev.getFullYear(), month: prev.getMonth() });
  };
  const handleNext = () => {
    const next = new Date(year, month + 1, 1);
    onChange({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={handlePrev}
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          border: "1px solid #e8e6e2",
          background: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Previous month"
      >
        <span style={{ fontSize: 14 }}>{"‹"}</span>
      </button>
      <div
        style={{
          minWidth: 0,
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#1a1917",
          }}
        >
          {months[month].label} {year}
        </div>
      </div>
      <button
        type="button"
        onClick={handleNext}
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          border: "1px solid #e8e6e2",
          background: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Next month"
      >
        <span style={{ fontSize: 14 }}>{"›"}</span>
      </button>
    </div>
  );
}

function DayCell({ day, dateKey, isBlocked, hasPrev, hasNext, onClick }) {
  if (day === null) {
    return <div />;
  }

  const radius =
    hasPrev && hasNext
      ? "0"
      : hasPrev
        ? "0 999px 999px 0"
        : hasNext
          ? "999px 0 0 999px"
          : "999px";

  return (
    <div
      aria-label={dateKey}
      onClick={isBlocked ? () => onClick?.(dateKey) : undefined}
      style={{
        width: "100%",
        aspectRatio: "1",
        borderRadius: radius,
        border: isBlocked ? "none" : "1px solid transparent",
        background: isBlocked ? "#e8875a" : "transparent",
        color: isBlocked ? "#ffffff" : "#9a9896",
        fontWeight: isBlocked ? 700 : 400,
        fontSize: "11px",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isBlocked ? "pointer" : "default",
      }}
    >
      {day}
    </div>
  );
}

function MonthlyGrid({ year, month, blockedDates, onDayClick }) {
  const cells = useMemo(() => {
    const days = getDaysInMonth(year, month);
    const offset = getStartOffset(year, month);
    const arr = [
      ...Array(offset).fill(null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  return (
    <div style={{ maxWidth: 420 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          marginBottom: 6,
        }}
      >
        {DAY_LABELS.map((lbl) => (
          <div
            key={lbl}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#c5c2be",
              textAlign: "center",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {lbl}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {cells.map((day, idx) => {
          if (day === null) {
            return <DayCell key={`e-${idx}`} day={null} />;
          }
          const key = toDateKey(year, month, day);
          const prevKey = day > 1 ? toDateKey(year, month, day - 1) : null;
          const nextKey =
            day < getDaysInMonth(year, month)
              ? toDateKey(year, month, day + 1)
              : null;
          const isBlocked = blockedDates.has(key);
          const hasPrev = !!prevKey && blockedDates.has(prevKey);
          const hasNext = !!nextKey && blockedDates.has(nextKey);
          return (
            <DayCell
              key={key}
              day={day}
              dateKey={key}
              isBlocked={isBlocked}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}

function LeadDetailsModal({ isOpen, dateKey, leads, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          background: "white",
          borderRadius: 18,
          padding: 20,
          width: "100%",
          maxWidth: 520,
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#1a1917",
              }}
            >
              Bookings on {dateKey}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#6b6966",
                marginTop: 2,
              }}
            >
              Confirmed leads with specialDay covering this date
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              border: "1px solid #e8e6e2",
              background: "#faf9f7",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close"
          >
            <span style={{ fontSize: 14 }}>✕</span>
          </button>
        </div>

        {leads.length === 0 && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#6b6966",
            }}
          >
            No bookings found for this date.
          </p>
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
          {leads.map((lead) => {
            const sd = lead.specialDay || {};
            const start = sd.startAt
              ? new Date(sd.startAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—";
            const end = sd.endAt
              ? new Date(sd.endAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—";

            return (
              <div
                key={lead._id}
                style={{
                  borderRadius: 14,
                  border: "1px solid #ece9e4",
                  padding: 12,
                  background: "#faf9f7",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 4,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#1a1917",
                    }}
                  >
                    {lead.contact?.name || "Unnamed lead"}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 999,
                      background: "#f0ede8",
                      color: "#6b6966",
                      textTransform: "uppercase",
                    }}
                  >
                    {lead.bookingType === "space_buyout" ? "Space" : "Venue"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b6966",
                    marginBottom: 4,
                  }}
                >
                  {lead.eventType || "Event"} at {lead.venue?.name || "Venue"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b6966",
                    marginBottom: 4,
                  }}
                >
                  {lead.contact?.phone}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#44413d",
                  }}
                >
                  {start} – {end}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CalendarMonthly() {
  const { access_token: token, venueId } = useSelector(
    (state) => state.user.value,
  );

  const now = new Date();
  const [activeTab, setActiveTab] = useState("all");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leadsByDate, setLeadsByDate] = useState({});
  const [detailDateKey, setDetailDateKey] = useState(null);
  const [detailLeads, setDetailLeads] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!token || !venueId) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = activeTab === "all" ? {} : { bookingType: activeTab };
        const data = await listConfirmedLeads(venueId, token, params);
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        const set = new Set();
        const map = {};
        for (const lead of arr) {
          const sd = lead?.specialDay;
          if (!sd?.startAt || !sd?.endAt) continue;
          const start = new Date(sd.startAt);
          const end = new Date(sd.endAt);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            continue;
          }
          const cursor = new Date(start);
          while (cursor <= end) {
            if (cursor.getFullYear() === year && cursor.getMonth() === month) {
              const key = toDateKey(
                cursor.getFullYear(),
                cursor.getMonth(),
                cursor.getDate(),
              );
              set.add(key);
              if (!map[key]) map[key] = [];
              map[key].push(lead);
            }
            cursor.setDate(cursor.getDate() + 1);
          }
        }
        if (!cancelled) {
          setBlockedDates(set);
          setLeadsByDate(map);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error?.message ||
              err.message ||
              "Failed to load monthly bookings.",
          );
          setBlockedDates(new Set());
          setLeadsByDate({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, venueId, year, month, activeTab]);

  const handleMonthChange = ({ year: y, month: m }) => {
    setYear(y);
    setMonth(m);
  };

  const handleDayClick = (key) => {
    const leads = leadsByDate[key] || [];
    setDetailDateKey(key);
    setDetailLeads(leads);
  };

  // Load stats for the month/year (all booking types)
  useEffect(() => {
    if (!token || !venueId) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await listConfirmedLeadStats(venueId, token, {
          year,
          month: month + 1,
        });
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, venueId, year, month]);

  return (
    <section
      style={{
        maxWidth: 600,
        margin: "0 auto",
        background: "white",
        borderRadius: 20,
        padding: 20,
        border: "1px solid #f1f0ee",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#1a1917",
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}
          >
            Monthly bookings
          </h2>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 12,
              color: "#9a9896",
            }}
          >
            Confirmed leads by month and booking type
          </p>
        </div>
        <MonthSelector year={year} month={month} onChange={handleMonthChange} />
      </div>

      {stats && (
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              flex: "1 1 120px",
              background: "#faf9f7",
              borderRadius: 14,
              padding: "12px 14px",
              border: "1px solid #f1f0ee",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#9a9896",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Total bookings
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#1a1917",
                marginTop: 2,
              }}
            >
              {stats.totalBookings ?? 0}
            </div>
          </div>

          <div
            style={{
              flex: "1 1 120px",
              background: "#faf9f7",
              borderRadius: 14,
              padding: "12px 14px",
              border: "1px solid #f1f0ee",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#9a9896",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Total revenue
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#e8875a",
                marginTop: 2,
              }}
            >
              ₹{(stats.totalRevenue ?? 0).toLocaleString("en-IN")}
            </div>
          </div>

          <div
            style={{
              flex: "1 1 120px",
              background: "#faf9f7",
              borderRadius: 14,
              padding: "12px 14px",
              border: "1px solid #f1f0ee",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#9a9896",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Total hours booked
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#7c6fcd",
                marginTop: 2,
              }}
            >
              {stats.totalHoursBooked ?? 0}h
            </div>
          </div>

          <div
            style={{
              flex: "1 1 120px",
              background: "#faf9f7",
              borderRadius: 14,
              padding: "12px 14px",
              border: "1px solid #f1f0ee",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#9a9896",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Event days
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#5ab99c",
                marginTop: 2,
              }}
            >
              {stats.totalEventDays ?? 0}
            </div>
          </div>

          <div
            style={{
              flex: "1 1 120px",
              background: "#faf9f7",
              borderRadius: 14,
              padding: "12px 14px",
              border: "1px solid #f1f0ee",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#9a9896",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Occupancy
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#7c6fcd",
                marginTop: 2,
              }}
            >
              {stats.occupancyPercent != null
                ? `${stats.occupancyPercent.toFixed(1)}%`
                : "0.0%"}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <TabButton
            key={t.key}
            active={activeTab === t.key}
            label={t.label}
            onClick={() => setActiveTab(t.key)}
          />
        ))}
      </div>

      {!!error && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: "#fde8e6",
            border: "1px solid #f6c8c2",
            color: "#a33b2d",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            color: "#6b6966",
            fontWeight: 700,
          }}
        >
          Loading bookings…
        </div>
      )}

      {!loading && (
        <MonthlyGrid
          year={year}
          month={month}
          blockedDates={blockedDates}
          onDayClick={handleDayClick}
        />
      )}

      <LeadDetailsModal
        isOpen={Boolean(detailDateKey)}
        dateKey={detailDateKey}
        leads={detailLeads}
        onClose={() => {
          setDetailDateKey(null);
          setDetailLeads([]);
        }}
      />
    </section>
  );
}
