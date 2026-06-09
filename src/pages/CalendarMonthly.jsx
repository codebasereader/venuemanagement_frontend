import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { listConfirmedLeads, listConfirmedLeadStats } from "../api/leads.js";
import {
  MONTH_FULL,
  toDateKey,
} from "../utils/calendarUtils.js";
import {
  LeadDetailsDrawer,
  MonthlyGrid,
  TABS,
  TabButton,
  YearGrid,
} from "./calendarMonthly/components/CalendarMonthlyComponents.jsx";

export default function CalendarMonthly() {
  const { access_token: token, venueId } = useSelector(
    (state) => state.user.value,
  );

  const now = new Date();
  const [activeTab, setActiveTab] = useState("all");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leadsByDate, setLeadsByDate] = useState({});
  const [detailDateKey, setDetailDateKey] = useState(null);
  const [detailLeads, setDetailLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const dynamicTitle = viewMode === "year" ? "Yearly bookings" : "Monthly bookings";
  const dynamicSubtitle =
    viewMode === "year"
      ? "Confirmed leads by year and booking type"
      : "Confirmed leads by month and booking type";

  useEffect(() => {
    if (!token || !venueId) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          year,
          view: viewMode,
          ...(viewMode === "month" ? { month: month + 1 } : {}),
          ...(activeTab === "all" ? {} : { bookingType: activeTab }),
        };
        const data = await listConfirmedLeads(venueId, token, params);
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.docs)
                ? data.docs
                : [];
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
            const sameMonth = cursor.getFullYear() === year && cursor.getMonth() === month;
            const sameYear = cursor.getFullYear() === year;
            if ((viewMode === "month" && sameMonth) || (viewMode === "year" && sameYear)) {
              const key = toDateKey(
                cursor.getFullYear(),
                cursor.getMonth(),
                cursor.getDate(),
              );
              if (!map[key]) map[key] = [];
              map[key].push(lead);
            }
            cursor.setDate(cursor.getDate() + 1);
          }
        }
        if (!cancelled) {
          setLeadsByDate(map);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error?.message ||
              err.message ||
              "Failed to load monthly bookings.",
          );
          setLeadsByDate({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, venueId, year, month, activeTab, viewMode]);

  const handleDayClick = (key) => {
    const leads = leadsByDate[key] || [];
    setDetailDateKey(key);
    setDetailLeads(leads);
  };

  // Load stats for selected calendar mode with server-side filters
  useEffect(() => {
    if (!token || !venueId) return;

    let cancelled = false;
    (async () => {
      try {
        const params = {
          year,
          view: viewMode,
          ...(viewMode === "month" ? { month: month + 1 } : {}),
          ...(activeTab === "all" ? {} : { bookingType: activeTab }),
        };
        const data = await listConfirmedLeadStats(venueId, token, params);
        const normalizedStats = {
          totalBookings: Number(data?.totalBookings ?? data?.bookings ?? 0),
          totalRevenue: Number(data?.totalRevenue ?? data?.revenue ?? 0),
          totalHoursBooked: Number(data?.totalHoursBooked ?? data?.hours ?? 0),
          totalEventDays: Number(data?.totalEventDays ?? data?.eventDays ?? 0),
          occupancyPercent: Number(data?.occupancyPercent ?? data?.occupancy ?? 0),
        };
        if (!cancelled) {
          setStats(normalizedStats);
        }
      } catch {
        if (!cancelled) {
          setStats({
            totalBookings: 0,
            totalRevenue: 0,
            totalHoursBooked: 0,
            totalEventDays: 0,
            occupancyPercent: 0,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, venueId, year, month, viewMode, activeTab]);

  useEffect(() => {
    setDetailDateKey(null);
    setDetailLeads([]);
  }, [viewMode, year, month, activeTab]);

  return (
    <section
      style={{
        maxWidth: 1280,
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
            {dynamicTitle}
          </h2>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 12,
              color: "#9a9896",
            }}
          >
            {dynamicSubtitle}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", border: "1px solid #e8e6e2", borderRadius: 10, overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              style={{ border: "none", padding: "8px 12px", background: viewMode === "month" ? "#1a1917" : "#fff", color: viewMode === "month" ? "#fff" : "#1a1917", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setViewMode("year")}
              style={{ border: "none", padding: "8px 12px", background: viewMode === "year" ? "#1a1917" : "#fff", color: viewMode === "year" ? "#fff" : "#1a1917", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
            >
              Yearly
            </button>
          </div>
          {viewMode === "month" && (
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ border: "1px solid #e8e6e2", borderRadius: 10, padding: "8px 10px", minWidth: 130 }}>
              {MONTH_FULL.map((monthName, idx) => (
                <option key={monthName} value={idx}>
                  {monthName}
                </option>
              ))}
            </select>
          )}
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ border: "1px solid #e8e6e2", borderRadius: 10, padding: "8px 10px", minWidth: 96 }}>
            {Array.from({ length: 16 }, (_, i) => now.getFullYear() - 5 + i).map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </div>
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

      {/* Booking type tabs hidden for now
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
      */}

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
        <>
          {viewMode === "month" && (
            <MonthlyGrid
              year={year}
              month={month}
              leadsByDate={leadsByDate}
              onDayClick={handleDayClick}
            />
          )}
          {viewMode === "year" && (
            <YearGrid year={year} leadsByDate={leadsByDate} onDayClick={handleDayClick} />
          )}
        </>
      )}

      <LeadDetailsDrawer
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
