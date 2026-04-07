import React, { useMemo } from "react";
import {
  calcMonthlyTotals,
  DURATIONS,
  fmtCurrency,
  fmtNum,
  parseNum,
  profitColor,
} from "../utils/targetHelpers";
import {
  TH_BASE,
  TD_BASE,
  inputStyle,
  btnPrimary,
  btnOutline,
  FONT,
} from "../utils/targetStyles";
import { EditIcon, SaveIcon, CancelIcon } from "./TargetIcons";
import PeriodSelector from "./PeriodSelector";

// ─── Table header ──────────────────────────────────────────────────────────────

function PlanTableHead() {
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
          Venue &amp; Spaces
        </th>
        <th
          rowSpan={2}
          style={{
            ...TH_BASE,
            textAlign: "left",
            color: "#aaa9a7",
            borderRight: "1px solid rgba(255,255,255,0.15)",
            verticalAlign: "middle",
          }}
        >
          Duration
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

// ─── Single data row (expands to 4 tr elements, one per duration) ──────────────

function PlanRow({ row, idx, editMode, onCellChange }) {
  const isVenueBuyout = row.rowType === "venue_buyout";
  const isEven = idx % 2 === 0;
  const baseBg = isEven ? "#fff" : "#fafaf9";

  return (
    <React.Fragment>
      {DURATIONS.map((dur, durIdx) => {
        const durData = row.durations?.[dur.key] ?? {};
        const expBiz = parseNum(durData.expectedBusiness);
        const expExp = parseNum(durData.expectedExpenses);
        const expProfit =
          expBiz !== null || expExp !== null
            ? (expBiz ?? 0) - (expExp ?? 0)
            : null;
        const actProfit =
          (durData.actualBusiness ?? 0) - (durData.actualExpenses ?? 0);
        const isFirst = durIdx === 0;
        const isLast = durIdx === DURATIONS.length - 1;
        const bottomBorder = isLast ? "2px solid #d4cfc4" : "1px solid #f0ede8";
        const cellBg = editMode ? "#fffdf7" : baseBg;

        return (
          <tr key={dur.key} style={{ background: cellBg }}>
            {/* Venue/Space name — only once, spans all duration rows */}
            {isFirst && (
              <td
                rowSpan={DURATIONS.length}
                style={{
                  ...TD_BASE,
                  textAlign: "left",
                  fontWeight: isVenueBuyout ? 700 : 500,
                  paddingLeft: isVenueBuyout ? 14 : 28,
                  color: isVenueBuyout ? "#1a1917" : "#4a4845",
                  borderRight: "1px solid #ece9e4",
                  borderBottom: "2px solid #d4cfc4",
                  verticalAlign: "top",
                  paddingTop: 14,
                }}
              >
                {!isVenueBuyout && (
                  <span
                    style={{ color: "#c5c2be", marginRight: 6, fontSize: 11 }}
                  >
                    └
                  </span>
                )}
                {row.spaceName}
              </td>
            )}

            {/* Duration label */}
            <td
              style={{
                ...TD_BASE,
                textAlign: "left",
                fontSize: 12,
                color: "#6b6966",
                fontWeight: 600,
                borderRight: "1px solid #ece9e4",
                borderBottom: bottomBorder,
                background: cellBg,
              }}
            >
              {dur.label}
            </td>

            {/* Expected Bookings */}
            <td
              style={{
                ...TD_BASE,
                background: cellBg,
                borderBottom: bottomBorder,
              }}
            >
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  value={durData.expectedBookings ?? ""}
                  onChange={(e) =>
                    onCellChange(
                      idx,
                      dur.key,
                      "expectedBookings",
                      e.target.value,
                    )
                  }
                  style={inputStyle}
                  aria-label={`Expected bookings ${row.spaceName} ${dur.label}`}
                />
              ) : (
                fmtNum(durData.expectedBookings)
              )}
            </td>

            {/* Expected Business */}
            <td
              style={{
                ...TD_BASE,
                background: cellBg,
                borderBottom: bottomBorder,
              }}
            >
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  value={durData.expectedBusiness ?? ""}
                  onChange={(e) =>
                    onCellChange(
                      idx,
                      dur.key,
                      "expectedBusiness",
                      e.target.value,
                    )
                  }
                  style={inputStyle}
                  aria-label={`Expected business ${row.spaceName} ${dur.label}`}
                />
              ) : (
                fmtCurrency(durData.expectedBusiness)
              )}
            </td>

            {/* Expected Expenses */}
            <td
              style={{
                ...TD_BASE,
                background: cellBg,
                borderBottom: bottomBorder,
              }}
            >
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  value={durData.expectedExpenses ?? ""}
                  onChange={(e) =>
                    onCellChange(
                      idx,
                      dur.key,
                      "expectedExpenses",
                      e.target.value,
                    )
                  }
                  style={inputStyle}
                  aria-label={`Expected expenses ${row.spaceName} ${dur.label}`}
                />
              ) : (
                fmtCurrency(durData.expectedExpenses)
              )}
            </td>

            {/* Expected Profits — auto-computed */}
            <td
              style={{
                ...TD_BASE,
                fontWeight: 600,
                color: profitColor(expProfit),
                borderRight: "1px solid #ece9e4",
                borderBottom: bottomBorder,
                background: cellBg,
              }}
            >
              {expProfit === null ? "—" : fmtCurrency(expProfit)}
            </td>

            {/* Actual Bookings */}
            <td style={{ ...TD_BASE, borderBottom: bottomBorder }}>
              {fmtNum(durData.actualBookings)}
            </td>

            {/* Actual Business */}
            <td style={{ ...TD_BASE, borderBottom: bottomBorder }}>
              {fmtCurrency(durData.actualBusiness)}
            </td>

            {/* Actual Expenses */}
            <td style={{ ...TD_BASE, borderBottom: bottomBorder }}>
              {fmtCurrency(durData.actualExpenses)}
            </td>

            {/* Actual Profits — auto-computed */}
            <td
              style={{
                ...TD_BASE,
                fontWeight: 600,
                color: profitColor(actProfit),
                borderBottom: bottomBorder,
              }}
            >
              {fmtCurrency(actProfit)}
            </td>
          </tr>
        );
      })}
    </React.Fragment>
  );
}

// ─── Totals row ────────────────────────────────────────────────────────────────

function TotalsRow({ totals, label = "Total" }) {
  const bgStyle = { ...TD_BASE, fontWeight: 700, background: "#f0ede8" };
  return (
    <tr style={{ background: "#f0ede8", borderTop: "2px solid #e0ddd8" }}>
      <td
        style={{
          ...bgStyle,
          textAlign: "left",
          borderRight: "1px solid #ece9e4",
        }}
      >
        {label}
      </td>
      {/* Empty Duration column */}
      <td style={{ ...bgStyle, borderRight: "1px solid #ece9e4" }} />
      <td style={bgStyle}>{fmtNum(totals.expectedBookings)}</td>
      <td style={bgStyle}>{fmtCurrency(totals.expectedBusiness)}</td>
      <td style={bgStyle}>{fmtCurrency(totals.expectedExpenses)}</td>
      <td
        style={{
          ...bgStyle,
          color: profitColor(totals.expectedProfits),
          borderRight: "1px solid #ece9e4",
        }}
      >
        {fmtCurrency(totals.expectedProfits)}
      </td>
      <td style={bgStyle}>{fmtNum(totals.actualBookings)}</td>
      <td style={bgStyle}>{fmtCurrency(totals.actualBusiness)}</td>
      <td style={bgStyle}>{fmtCurrency(totals.actualExpenses)}</td>
      <td style={{ ...bgStyle, color: profitColor(totals.actualProfits) }}>
        {fmtCurrency(totals.actualProfits)}
      </td>
    </tr>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

/**
 * Desktop table view for the monthly business plan.
 *
 * Props:
 *   rows            — array of plan rows (merged spaces + api data)
 *   editMode        — whether expected columns are editable
 *   saving          — save API in-flight
 *   onCellChange    — (idx, field, value) => void
 *   onEdit          — () => void
 *   onSave          — () => void
 *   onCancel        — () => void
 *   selectedMonth   — 1-12
 *   selectedYear    — number
 *   onMonthChange   — (m) => void
 *   onYearChange    — (y) => void
 */
export default function MonthlyPlanTable({
  rows,
  editMode,
  saving,
  onCellChange,
  onEdit,
  onSave,
  onCancel,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) {
  const totals = useMemo(() => calcMonthlyTotals(rows), [rows]);

  return (
    <div>
      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <PeriodSelector
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          disabled={editMode}
          showMonth
        />

        <div style={{ display: "flex", gap: 8 }}>
          {!editMode ? (
            <button type="button" onClick={onEdit} style={btnPrimary}>
              <EditIcon />
              Edit Expected
            </button>
          ) : (
            <>
              <button type="button" onClick={onCancel} style={btnOutline}>
                <CancelIcon />
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                style={{ ...btnPrimary, opacity: saving ? 0.65 : 1 }}
                disabled={saving}
              >
                <SaveIcon />
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scrollable table */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: 10,
          border: "1px solid #ece9e4",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 1120 }}
        >
          <colgroup>
            <col style={{ minWidth: 190 }} />
            <col style={{ minWidth: 110 }} />
            <col style={{ minWidth: 110 }} />
            <col style={{ minWidth: 135 }} />
            <col style={{ minWidth: 135 }} />
            <col style={{ minWidth: 135 }} />
            <col style={{ minWidth: 110 }} />
            <col style={{ minWidth: 135 }} />
            <col style={{ minWidth: 135 }} />
            <col style={{ minWidth: 135 }} />
          </colgroup>

          <PlanTableHead />

          <tbody>
            {rows.map((row, idx) => (
              <PlanRow
                key={
                  row.rowType === "venue_buyout"
                    ? "venue_buyout"
                    : row.spaceId?.toString()
                }
                row={row}
                idx={idx}
                editMode={editMode}
                onCellChange={onCellChange}
              />
            ))}
            {rows.length > 0 && <TotalsRow totals={totals} label="Total" />}
          </tbody>
        </table>
      </div>
    </div>
  );
}
