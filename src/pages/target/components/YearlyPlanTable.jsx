import React, { useMemo } from "react";
import {
  MONTH_NAMES,
  CURRENT_YEAR,
  CURRENT_MONTH,
  calcYearlyTotals,
  fmtCurrency,
  fmtNum,
  profitColor,
} from "../utils/targetHelpers";
import { TH_BASE, TD_BASE, FONT } from "../utils/targetStyles";
import PeriodSelector from "./PeriodSelector";

// ─── Table head ────────────────────────────────────────────────────────────────

function YearlyTableHead() {
  return (
    <thead>
      <tr style={{ background: "#1a1917" }}>
        <th
          rowSpan={2}
          style={{
            ...TH_BASE,
            textAlign: "left",
            color: "#fff",
            borderRight: "1px solid rgba(255,255,255,0.15)",
            verticalAlign: "middle",
          }}
        >
          Month
        </th>
        <th
          colSpan={4}
          style={{
            ...TH_BASE,
            textAlign: "center",
            color: "#f5d79e",
            borderRight: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          Expected (Plan)
        </th>
        <th
          colSpan={4}
          style={{ ...TH_BASE, textAlign: "center", color: "#a8e6cf" }}
        >
          Actual
        </th>
      </tr>
      <tr style={{ background: "#2d2c2a" }}>
        <th style={{ ...TH_BASE, color: "#f5d79e" }}>Bookings</th>
        <th style={{ ...TH_BASE, color: "#f5d79e" }}>Business (₹)</th>
        <th style={{ ...TH_BASE, color: "#f5d79e" }}>Expenses (₹)</th>
        <th
          style={{
            ...TH_BASE,
            color: "#f5d79e",
            borderRight: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          Profits (₹)
        </th>
        <th style={{ ...TH_BASE, color: "#a8e6cf" }}>Bookings</th>
        <th style={{ ...TH_BASE, color: "#a8e6cf" }}>Business (₹)</th>
        <th style={{ ...TH_BASE, color: "#a8e6cf" }}>Expenses (₹)</th>
        <th style={{ ...TH_BASE, color: "#a8e6cf" }}>Profits (₹)</th>
      </tr>
    </thead>
  );
}

// ─── Single month row ──────────────────────────────────────────────────────────

function YearlyMonthRow({ row, yearlyYear }) {
  const isCurrent = row.month === CURRENT_MONTH && yearlyYear === CURRENT_YEAR;

  const expProfit =
    row.expectedBusiness !== null || row.expectedExpenses !== null
      ? (row.expectedBusiness ?? 0) - (row.expectedExpenses ?? 0)
      : null;
  const actProfit =
    row.actualBusiness !== null || row.actualExpenses !== null
      ? (row.actualBusiness ?? 0) - (row.actualExpenses ?? 0)
      : null;

  return (
    <tr
      style={{
        background: isCurrent ? "#fffbf0" : row.isEven ? "#fff" : "#fafaf9",
      }}
    >
      <td
        style={{
          ...TD_BASE,
          textAlign: "left",
          fontWeight: isCurrent ? 700 : 600,
          borderRight: "1px solid #ece9e4",
        }}
      >
        {row.monthName}
        {isCurrent && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 10,
              background: "#f5d79e",
              color: "#92400e",
              padding: "2px 7px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            NOW
          </span>
        )}
      </td>
      <td style={TD_BASE}>
        {row.expectedBookings !== null ? fmtNum(row.expectedBookings) : "—"}
      </td>
      <td style={TD_BASE}>
        {row.expectedBusiness !== null
          ? fmtCurrency(row.expectedBusiness)
          : "—"}
      </td>
      <td style={TD_BASE}>
        {row.expectedExpenses !== null
          ? fmtCurrency(row.expectedExpenses)
          : "—"}
      </td>
      <td
        style={{
          ...TD_BASE,
          fontWeight: 600,
          color: profitColor(expProfit),
          borderRight: "1px solid #ece9e4",
        }}
      >
        {expProfit === null ? "—" : fmtCurrency(expProfit)}
      </td>
      <td style={TD_BASE}>
        {row.actualBookings !== null ? fmtNum(row.actualBookings) : "—"}
      </td>
      <td style={TD_BASE}>
        {row.actualBusiness !== null ? fmtCurrency(row.actualBusiness) : "—"}
      </td>
      <td style={TD_BASE}>
        {row.actualExpenses !== null ? fmtCurrency(row.actualExpenses) : "—"}
      </td>
      <td
        style={{
          ...TD_BASE,
          fontWeight: 600,
          color: profitColor(actProfit),
        }}
      >
        {actProfit === null ? "—" : fmtCurrency(actProfit)}
      </td>
    </tr>
  );
}

// ─── Grand Total row ───────────────────────────────────────────────────────────

function GrandTotalRow({ totals }) {
  const bg = { ...TD_BASE, fontWeight: 700, background: "#f0ede8" };

  const maybeNum = (val, fmt) => (val !== null ? fmt(val) : "—");

  return (
    <tr style={{ background: "#f0ede8", borderTop: "2px solid #e0ddd8" }}>
      <td
        style={{ ...bg, textAlign: "left", borderRight: "1px solid #ece9e4" }}
      >
        Grand Total
      </td>
      <td style={bg}>{maybeNum(totals.expectedBookings, fmtNum)}</td>
      <td style={bg}>{maybeNum(totals.expectedBusiness, fmtCurrency)}</td>
      <td style={bg}>{maybeNum(totals.expectedExpenses, fmtCurrency)}</td>
      <td
        style={{
          ...bg,
          color: profitColor(totals.expectedProfits),
          borderRight: "1px solid #ece9e4",
        }}
      >
        {maybeNum(totals.expectedProfits, fmtCurrency)}
      </td>
      <td style={bg}>{maybeNum(totals.actualBookings, fmtNum)}</td>
      <td style={bg}>{maybeNum(totals.actualBusiness, fmtCurrency)}</td>
      <td style={bg}>{maybeNum(totals.actualExpenses, fmtCurrency)}</td>
      <td style={{ ...bg, color: profitColor(totals.actualProfits) }}>
        {maybeNum(totals.actualProfits, fmtCurrency)}
      </td>
    </tr>
  );
}

// ─── Mobile yearly cards view ─────────────────────────────────────────────────

function YearlyMobileCards({ rows, totals, yearlyYear }) {
  return (
    <div>
      {rows.map((row) => {
        const isCurrent =
          row.month === CURRENT_MONTH && yearlyYear === CURRENT_YEAR;
        const expProfit =
          row.expectedBusiness !== null || row.expectedExpenses !== null
            ? (row.expectedBusiness ?? 0) - (row.expectedExpenses ?? 0)
            : null;
        const actProfit =
          row.actualBusiness !== null || row.actualExpenses !== null
            ? (row.actualBusiness ?? 0) - (row.actualExpenses ?? 0)
            : null;

        return (
          <div
            key={row.month}
            style={{
              background: isCurrent ? "#fffbf0" : "#fff",
              border: `1.5px solid ${isCurrent ? "#f5d79e" : "#ece9e4"}`,
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#1a1917",
                }}
              >
                {row.monthName}
              </span>
              {isCurrent && (
                <span
                  style={{
                    fontSize: 10,
                    background: "#f5d79e",
                    color: "#92400e",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontFamily: FONT,
                  }}
                >
                  NOW
                </span>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {/* Expected */}
              <div
                style={{
                  background: "#faf8f5",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#b8935a",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 8,
                  }}
                >
                  Expected
                </div>
                {[
                  {
                    label: "Bookings",
                    val:
                      row.expectedBookings !== null
                        ? fmtNum(row.expectedBookings)
                        : "—",
                  },
                  {
                    label: "Business",
                    val:
                      row.expectedBusiness !== null
                        ? fmtCurrency(row.expectedBusiness)
                        : "—",
                  },
                  {
                    label: "Expenses",
                    val:
                      row.expectedExpenses !== null
                        ? fmtCurrency(row.expectedExpenses)
                        : "—",
                  },
                  {
                    label: "Profits",
                    val: expProfit === null ? "—" : fmtCurrency(expProfit),
                    color: profitColor(expProfit),
                  },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      borderBottom: "1px solid #ece9e4",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: 11,
                        color: "#7a7774",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: 12,
                        fontWeight: 600,
                        color: color || "#1a1917",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actual */}
              <div
                style={{
                  background: "#f4fdf8",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#16875f",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 8,
                  }}
                >
                  Actual
                </div>
                {[
                  {
                    label: "Bookings",
                    val:
                      row.actualBookings !== null
                        ? fmtNum(row.actualBookings)
                        : "—",
                  },
                  {
                    label: "Business",
                    val:
                      row.actualBusiness !== null
                        ? fmtCurrency(row.actualBusiness)
                        : "—",
                  },
                  {
                    label: "Expenses",
                    val:
                      row.actualExpenses !== null
                        ? fmtCurrency(row.actualExpenses)
                        : "—",
                  },
                  {
                    label: "Profits",
                    val: actProfit === null ? "—" : fmtCurrency(actProfit),
                    color: profitColor(actProfit),
                  },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      borderBottom: "1px solid #e0f9ef",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: 11,
                        color: "#7a7774",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT,
                        fontSize: 12,
                        fontWeight: 600,
                        color: color || "#1a1917",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Grand total card */}
      <div
        style={{
          background: "#1a1917",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 13,
            color: "#f5d79e",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Grand Total
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {[
            {
              title: "Expected",
              color: "#f5d79e",
              items: [
                {
                  label: "Bookings",
                  val:
                    totals.expectedBookings !== null
                      ? fmtNum(totals.expectedBookings)
                      : "—",
                },
                {
                  label: "Business",
                  val:
                    totals.expectedBusiness !== null
                      ? fmtCurrency(totals.expectedBusiness)
                      : "—",
                },
                {
                  label: "Expenses",
                  val:
                    totals.expectedExpenses !== null
                      ? fmtCurrency(totals.expectedExpenses)
                      : "—",
                },
                {
                  label: "Profits",
                  val:
                    totals.expectedProfits !== null
                      ? fmtCurrency(totals.expectedProfits)
                      : "—",
                  color: profitColor(totals.expectedProfits),
                },
              ],
            },
            {
              title: "Actual",
              color: "#a8e6cf",
              items: [
                {
                  label: "Bookings",
                  val:
                    totals.actualBookings !== null
                      ? fmtNum(totals.actualBookings)
                      : "—",
                },
                {
                  label: "Business",
                  val:
                    totals.actualBusiness !== null
                      ? fmtCurrency(totals.actualBusiness)
                      : "—",
                },
                {
                  label: "Expenses",
                  val:
                    totals.actualExpenses !== null
                      ? fmtCurrency(totals.actualExpenses)
                      : "—",
                },
                {
                  label: "Profits",
                  val:
                    totals.actualProfits !== null
                      ? fmtCurrency(totals.actualProfits)
                      : "—",
                  color: profitColor(totals.actualProfits),
                },
              ],
            },
          ].map(({ title, color, items }) => (
            <div key={title}>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 10,
                  color,
                  fontWeight: 700,
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                {title}
              </div>
              {items.map(({ label, val, color: itemColor }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    style={{ fontFamily: FONT, fontSize: 11, color: "#9a9896" }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: 12,
                      fontWeight: 700,
                      color: itemColor || "#fff",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

/**
 * Yearly summary view — desktop table + mobile cards.
 *
 * Props:
 *   yearlyYear     — selected year
 *   onYearChange   — (y) => void
 *   yearlyData     — array from API: [{ month, totalExpectedBookings, … }]
 */
export default function YearlyPlanTable({
  yearlyYear,
  onYearChange,
  yearlyData,
}) {
  const rows = useMemo(() => {
    return MONTH_NAMES.map((name, i) => {
      const month = i + 1;
      const d = yearlyData?.find((m) => m.month === month);
      return {
        month,
        monthName: name.slice(0, 3),
        isEven: i % 2 === 0,
        expectedBookings: d?.totalExpectedBookings ?? null,
        expectedBusiness: d?.totalExpectedBusiness ?? null,
        expectedExpenses: d?.totalExpectedExpenses ?? null,
        actualBookings: d?.totalActualBookings ?? null,
        actualBusiness: d?.totalActualBusiness ?? null,
        actualExpenses: d?.totalActualExpenses ?? null,
      };
    });
  }, [yearlyData]);

  const totals = useMemo(() => calcYearlyTotals(rows), [rows]);

  return (
    <div>
      {/* Year selector */}
      <div style={{ marginBottom: 20 }}>
        <PeriodSelector
          year={yearlyYear}
          onYearChange={onYearChange}
          showMonth={false}
        />
      </div>

      {/* Desktop table */}
      <div className="target-desktop-only">
        <div
          style={{
            overflowX: "auto",
            borderRadius: 10,
            border: "1px solid #ece9e4",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 1000,
            }}
          >
            <colgroup>
              <col style={{ minWidth: 100 }} />
              <col style={{ minWidth: 120 }} />
              <col style={{ minWidth: 145 }} />
              <col style={{ minWidth: 145 }} />
              <col style={{ minWidth: 145 }} />
              <col style={{ minWidth: 120 }} />
              <col style={{ minWidth: 145 }} />
              <col style={{ minWidth: 145 }} />
              <col style={{ minWidth: 145 }} />
            </colgroup>
            <YearlyTableHead />
            <tbody>
              {rows.map((row) => (
                <YearlyMonthRow
                  key={row.month}
                  row={row}
                  yearlyYear={yearlyYear}
                />
              ))}
              <GrandTotalRow totals={totals} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="target-mobile-only">
        <YearlyMobileCards
          rows={rows}
          totals={totals}
          yearlyYear={yearlyYear}
        />
      </div>
    </div>
  );
}
