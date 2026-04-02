import React, { useMemo, useState } from "react";
import {
  MONTH_FULL,
  getDaysInMonth,
  getStartOffset,
} from "../../../utils/calendarUtils";
import {
  getEmiDay,
  generateEmiMonths,
  getEmiMonthStatus,
  formatCurrency,
  formatMonthYear,
} from "./emiUtils";
import MarkPaidModal from "./MarkPaidModal";
import PaymentDetailsModal from "./PaymentDetailsModal";

// ── Status colour palette ──────────────────────────────────────────────────

const STATUS = {
  paid: { bg: "#dcfce7", border: "#86efac", text: "#15803d" },
  due_soon: { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
  overdue: { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b" },
  upcoming: { bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1" },
};

// ── EMI card rendered inside a calendar day cell ──────────────────────────

function EmiCard({ bill, month, year, statusInfo, onClick }) {
  const palette = STATUS[statusInfo.type] || STATUS.upcoming;
  const amount = statusInfo.status?.emiAmount ?? bill.defaultAmount;

  let badge = "";
  if (statusInfo.type === "paid") badge = "✓ Paid";
  else if (statusInfo.type === "due_soon")
    badge =
      statusInfo.daysLeft === 0
        ? "Due today!"
        : `Due in ${statusInfo.daysLeft}d`;
  else if (statusInfo.type === "overdue") badge = "Overdue";
  else badge = "Upcoming";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick && onClick()}
      title={`${bill.name} — ${formatMonthYear(month, year)}\n${badge}`}
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 5,
        padding: "3px 5px",
        marginBottom: 3,
        cursor: "pointer",
        outline: "none",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          color: palette.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.4,
        }}
      >
        {bill.name}
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 9,
          color: palette.text,
          lineHeight: 1.3,
          opacity: 0.9,
        }}
      >
        {formatCurrency(amount)}
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 9,
          color: palette.text,
          lineHeight: 1.2,
          opacity: 0.75,
          fontWeight: 600,
        }}
      >
        {badge}
      </div>
    </div>
  );
}

// ── Main Calendar View ────────────────────────────────────────────────────

export default function EmiCalendarView({
  bills,
  onUpsertStatus,
  markPaidSubmitting,
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-based (JS)
  const [markPaidTarget, setMarkPaidTarget] = useState(null);
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null);

  const handlePrev = () => {
    const d = new Date(year, calMonth - 1, 1);
    setYear(d.getFullYear());
    setCalMonth(d.getMonth());
  };
  const handleNext = () => {
    const d = new Date(year, calMonth + 1, 1);
    setYear(d.getFullYear());
    setCalMonth(d.getMonth());
  };

  const daysInMonth = getDaysInMonth(year, calMonth);
  const offset = getStartOffset(year, calMonth);

  const cells = useMemo(() => {
    const arr = [
      ...Array(offset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [offset, daysInMonth]);

  // Map: day-of-month → [{bill, statusInfo}]
  const emisByDay = useMemo(() => {
    const map = {};
    const displayMonth = calMonth + 1; // 1-based

    bills.forEach((bill) => {
      if (!bill.emiDate || !bill.emi_end_date) return;
      const spans = generateEmiMonths(bill.emiDate, bill.emi_end_date);
      const inThisMonth = spans.some(
        (s) => s.month === displayMonth && s.year === year,
      );
      if (!inThisMonth) return;

      const emiDay = getEmiDay(bill.emiDate);
      const clampedDay = Math.min(emiDay, daysInMonth);
      const statusInfo = getEmiMonthStatus(bill, displayMonth, year);

      if (!map[clampedDay]) map[clampedDay] = [];
      map[clampedDay].push({ bill, statusInfo });
    });
    return map;
  }, [bills, calMonth, year, daysInMonth]);

  const todayDay =
    today.getFullYear() === year && today.getMonth() === calMonth
      ? today.getDate()
      : null;

  const handleCardClick = (bill, month1Based, statusInfo) => {
    if (statusInfo.status?.paid) {
      setViewDetailsTarget({
        bill,
        month: month1Based,
        year,
        status: statusInfo.status,
      });
    } else {
      setMarkPaidTarget({ bill, month: month1Based, year });
    }
  };

  const handleMarkPaidConfirm = async (payload) => {
    await onUpsertStatus(markPaidTarget.bill._id, payload);
    setMarkPaidTarget(null);
  };

  const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        {[
          { key: "paid", label: "Paid" },
          { key: "due_soon", label: "Due soon (≤10 days)" },
          { key: "overdue", label: "Overdue" },
          { key: "upcoming", label: "Upcoming" },
        ].map(({ key, label }) => (
          <div
            key={key}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                background: STATUS[key].bg,
                border: `1.5px solid ${STATUS[key].border}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: "#6b6966",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Month navigator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous month"
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: "1px solid #e8e6e2",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#6b6966",
          }}
        >
          ‹
        </button>
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(15px,3.5vw,19px)",
            color: "#1a1917",
            fontWeight: 700,
            minWidth: 160,
            textAlign: "center",
          }}
        >
          {MONTH_FULL[calMonth]} {year}
        </span>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next month"
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: "1px solid #e8e6e2",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#6b6966",
          }}
        >
          ›
        </button>

        {/* Jump to today */}
        {!(today.getFullYear() === year && today.getMonth() === calMonth) && (
          <button
            type="button"
            onClick={() => {
              setYear(today.getFullYear());
              setCalMonth(today.getMonth());
            }}
            style={{
              marginLeft: 4,
              padding: "5px 12px",
              border: "1px solid #e8e6e2",
              background: "#fff",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "#6b6966",
            }}
          >
            Today
          </button>
        )}
      </div>

      {/* Calendar grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 560 }}>
          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
              marginBottom: 4,
            }}
          >
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9a9896",
                  fontFamily: "'DM Sans', sans-serif",
                  paddingBottom: 6,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
            }}
          >
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`pad-${idx}`} style={{ minHeight: 88 }} />;
              }
              const isToday = day === todayDay;
              const cellEmis = emisByDay[day] || [];

              return (
                <div
                  key={day}
                  style={{
                    minHeight: 88,
                    border: isToday ? "2px solid #e8875a" : "1px solid #ece9e4",
                    borderRadius: 8,
                    padding: "4px",
                    background: isToday ? "#fdf8f4" : "#fff",
                    verticalAlign: "top",
                    transition: "border-color 0.1s",
                  }}
                >
                  {/* Day number */}
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      fontWeight: isToday ? 800 : 500,
                      color: isToday ? "#e8875a" : "#6b6966",
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: 3,
                      lineHeight: 1,
                    }}
                  >
                    {day}
                  </div>

                  {/* EMI cards */}
                  {cellEmis.map(({ bill, statusInfo }) => (
                    <EmiCard
                      key={bill._id}
                      bill={bill}
                      month={calMonth + 1}
                      year={year}
                      statusInfo={statusInfo}
                      onClick={() =>
                        handleCardClick(bill, calMonth + 1, statusInfo)
                      }
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty state for this month */}
      {Object.keys(emisByDay).length === 0 && bills.length > 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "20px 0",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#9a9896",
            marginTop: 8,
          }}
        >
          No EMIs scheduled for {MONTH_FULL[calMonth]} {year}
        </div>
      )}

      {/* Modals */}
      {markPaidTarget && (
        <MarkPaidModal
          isOpen
          onClose={() => setMarkPaidTarget(null)}
          onConfirm={handleMarkPaidConfirm}
          submitting={markPaidSubmitting}
          bill={markPaidTarget.bill}
          month={markPaidTarget.month}
          year={markPaidTarget.year}
        />
      )}

      {viewDetailsTarget && (
        <PaymentDetailsModal
          isOpen
          onClose={() => setViewDetailsTarget(null)}
          bill={viewDetailsTarget.bill}
          month={viewDetailsTarget.month}
          year={viewDetailsTarget.year}
          status={viewDetailsTarget.status}
        />
      )}
    </div>
  );
}
