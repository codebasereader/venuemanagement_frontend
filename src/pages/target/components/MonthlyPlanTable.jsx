import React, { useMemo } from "react";
import {
  calcMonthlyTotals,
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

// ─── Single data row ───────────────────────────────────────────────────────────

function PlanRow({ row, idx, editMode, onCellChange }) {
  const expBiz = parseNum(row.expectedBusiness);
  const expExp = parseNum(row.expectedExpenses);
  const expProfit =
    expBiz !== null || expExp !== null ? (expBiz ?? 0) - (expExp ?? 0) : null;
  const actProfit = (row.actualBusiness ?? 0) - (row.actualExpenses ?? 0);
  const isEven = idx % 2 === 0;
  const isVenueBuyout = row.rowType === "venue_buyout";
  const rowKey = isVenueBuyout ? "venue_buyout" : row.spaceId?.toString();

  return (
    <tr key={rowKey} style={{ background: isEven ? "#fff" : "#fafaf9" }}>
      {/* Label */}
      <td
        style={{
          ...TD_BASE,
          textAlign: "left",
          fontWeight: isVenueBuyout ? 700 : 500,
          paddingLeft: isVenueBuyout ? 14 : 28,
          color: isVenueBuyout ? "#1a1917" : "#4a4845",
          borderRight: "1px solid #ece9e4",
        }}
      >
        {!isVenueBuyout && (
          <span style={{ color: "#c5c2be", marginRight: 6, fontSize: 11 }}>
            └
          </span>
        )}
        {row.spaceName}
      </td>

      {/* Expected Bookings */}
      <td style={{ ...TD_BASE, background: editMode ? "#fffdf7" : undefined }}>
        {editMode ? (
          <input
            type="number"
            min="0"
            value={row.expectedBookings}
            onChange={(e) =>
              onCellChange(idx, "expectedBookings", e.target.value)
            }
            style={inputStyle}
            aria-label={`Expected bookings for ${row.spaceName}`}
          />
        ) : (
          fmtNum(row.expectedBookings)
        )}
      </td>

      {/* Expected Business */}
      <td style={{ ...TD_BASE, background: editMode ? "#fffdf7" : undefined }}>
        {editMode ? (
          <input
            type="number"
            min="0"
            value={row.expectedBusiness}
            onChange={(e) =>
              onCellChange(idx, "expectedBusiness", e.target.value)
            }
            style={inputStyle}
            aria-label={`Expected business for ${row.spaceName}`}
          />
        ) : (
          fmtCurrency(row.expectedBusiness)
        )}
      </td>

      {/* Expected Expenses */}
      <td style={{ ...TD_BASE, background: editMode ? "#fffdf7" : undefined }}>
        {editMode ? (
          <input
            type="number"
            min="0"
            value={row.expectedExpenses}
            onChange={(e) =>
              onCellChange(idx, "expectedExpenses", e.target.value)
            }
            style={inputStyle}
            aria-label={`Expected expenses for ${row.spaceName}`}
          />
        ) : (
          fmtCurrency(row.expectedExpenses)
        )}
      </td>

      {/* Expected Profits — always auto-computed */}
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

      {/* Actual Bookings */}
      <td style={TD_BASE}>{fmtNum(row.actualBookings)}</td>

      {/* Actual Business */}
      <td style={TD_BASE}>{fmtCurrency(row.actualBusiness)}</td>

      {/* Actual Expenses */}
      <td style={TD_BASE}>{fmtCurrency(row.actualExpenses)}</td>

      {/* Actual Profits — auto-computed */}
      <td
        style={{ ...TD_BASE, fontWeight: 600, color: profitColor(actProfit) }}
      >
        {fmtCurrency(actProfit)}
      </td>
    </tr>
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
            <col style={{ minWidth: 120 }} />
            <col style={{ minWidth: 145 }} />
            <col style={{ minWidth: 145 }} />
            <col style={{ minWidth: 145 }} />
            <col style={{ minWidth: 120 }} />
            <col style={{ minWidth: 145 }} />
            <col style={{ minWidth: 145 }} />
            <col style={{ minWidth: 145 }} />
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
