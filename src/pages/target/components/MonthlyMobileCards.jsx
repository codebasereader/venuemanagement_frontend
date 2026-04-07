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
  FONT,
  inputStyle,
  btnPrimary,
  btnOutline,
} from "../utils/targetStyles";
import { EditIcon, SaveIcon, CancelIcon } from "./TargetIcons";
import PeriodSelector from "./PeriodSelector";

// ─── Single space card ─────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  valueColor,
  editMode,
  field,
  rowIdx,
  durKey,
  onCellChange,
  rawValue,
  isEditable,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: "1px solid #f5f3f0",
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 12,
          color: "#7a7774",
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {editMode && isEditable ? (
        <input
          type="number"
          min="0"
          value={rawValue}
          onChange={(e) => onCellChange(rowIdx, durKey, field, e.target.value)}
          style={{ ...inputStyle, minWidth: 70, maxWidth: 120 }}
        />
      ) : (
        <span
          style={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            color: valueColor || "#1a1917",
            textAlign: "right",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function SpaceCard({ row, idx, editMode, onCellChange }) {
  const isVenueBuyout = row.rowType === "venue_buyout";

  return (
    <div
      style={{
        background: isVenueBuyout ? "#fafaf9" : "#fff",
        border: `1.5px solid ${isVenueBuyout ? "#e0ddd8" : "#ece9e4"}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 12,
      }}
    >
      {/* Card title */}
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 14,
          color: "#1a1917",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {!isVenueBuyout && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#c5c2be",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
        )}
        {row.spaceName}
        {isVenueBuyout && (
          <span
            style={{
              marginLeft: 6,
              fontSize: 10,
              background: "#1a1917",
              color: "#fff",
              padding: "2px 7px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            VENUE
          </span>
        )}
      </div>

      {/* Per-duration sections */}
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

        return (
          <div
            key={dur.key}
            style={{
              marginBottom: durIdx < DURATIONS.length - 1 ? 12 : 0,
              paddingBottom: durIdx < DURATIONS.length - 1 ? 12 : 0,
              borderBottom:
                durIdx < DURATIONS.length - 1 ? "1px dashed #ece9e4" : "none",
            }}
          >
            {/* Duration label */}
            <div
              style={{
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 700,
                color: "#c9a84c",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
              }}
            >
              {dur.label}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {/* Expected */}
              <div
                style={{
                  background: editMode ? "#fffdf7" : "#faf8f5",
                  borderRadius: 8,
                  padding: "8px 10px",
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
                    marginBottom: 6,
                  }}
                >
                  Expected
                </div>
                <StatRow
                  label="Bookings"
                  value={fmtNum(durData.expectedBookings)}
                  rawValue={durData.expectedBookings}
                  field="expectedBookings"
                  rowIdx={idx}
                  durKey={dur.key}
                  editMode={editMode}
                  onCellChange={onCellChange}
                  isEditable
                />
                <StatRow
                  label="Business"
                  value={fmtCurrency(durData.expectedBusiness)}
                  rawValue={durData.expectedBusiness}
                  field="expectedBusiness"
                  rowIdx={idx}
                  durKey={dur.key}
                  editMode={editMode}
                  onCellChange={onCellChange}
                  isEditable
                />
                <StatRow
                  label="Expenses"
                  value={fmtCurrency(durData.expectedExpenses)}
                  rawValue={durData.expectedExpenses}
                  field="expectedExpenses"
                  rowIdx={idx}
                  durKey={dur.key}
                  editMode={editMode}
                  onCellChange={onCellChange}
                  isEditable
                />
                <StatRow
                  label="Profits"
                  value={expProfit === null ? "\u2014" : fmtCurrency(expProfit)}
                  valueColor={profitColor(expProfit)}
                  isEditable={false}
                  editMode={false}
                />
              </div>

              {/* Actual */}
              <div
                style={{
                  background: "#f4fdf8",
                  borderRadius: 8,
                  padding: "8px 10px",
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
                    marginBottom: 6,
                  }}
                >
                  Actual
                </div>
                <StatRow
                  label="Bookings"
                  value={fmtNum(durData.actualBookings)}
                  isEditable={false}
                  editMode={false}
                />
                <StatRow
                  label="Business"
                  value={fmtCurrency(durData.actualBusiness)}
                  isEditable={false}
                  editMode={false}
                />
                <StatRow
                  label="Expenses"
                  value={fmtCurrency(durData.actualExpenses)}
                  isEditable={false}
                  editMode={false}
                />
                <StatRow
                  label="Profits"
                  value={fmtCurrency(actProfit)}
                  valueColor={profitColor(actProfit)}
                  isEditable={false}
                  editMode={false}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Totals summary card ───────────────────────────────────────────────────────

function TotalsSummaryCard({ totals }) {
  return (
    <div
      style={{
        background: "#1a1917",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 12,
        color: "#fff",
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
        Totals
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Expected totals */}
        <div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 10,
              color: "#f5d79e",
              fontWeight: 700,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Expected
          </div>
          {[
            { label: "Bookings", val: fmtNum(totals.expectedBookings) },
            { label: "Business", val: fmtCurrency(totals.expectedBusiness) },
            { label: "Expenses", val: fmtCurrency(totals.expectedExpenses) },
            {
              label: "Profits",
              val: fmtCurrency(totals.expectedProfits),
              color: profitColor(totals.expectedProfits),
            },
          ].map(({ label, val, color }) => (
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
                  color: color || "#fff",
                }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>
        {/* Actual totals */}
        <div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 10,
              color: "#a8e6cf",
              fontWeight: 700,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Actual
          </div>
          {[
            { label: "Bookings", val: fmtNum(totals.actualBookings) },
            { label: "Business", val: fmtCurrency(totals.actualBusiness) },
            { label: "Expenses", val: fmtCurrency(totals.actualExpenses) },
            {
              label: "Profits",
              val: fmtCurrency(totals.actualProfits),
              color: profitColor(totals.actualProfits),
            },
          ].map(({ label, val, color }) => (
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
                  color: color || "#a8e6cf",
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
}

// ─── Main export ───────────────────────────────────────────────────────────────

/**
 * Mobile card-based view for the monthly business plan.
 * Same props as MonthlyPlanTable.
 */
export default function MonthlyMobileCards({
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
      {/* Controls */}
      <div style={{ marginBottom: 16 }}>
        <PeriodSelector
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          disabled={editMode}
          showMonth
        />
      </div>

      {/* Edit / Save / Cancel */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        {!editMode ? (
          <button
            type="button"
            onClick={onEdit}
            style={{ ...btnPrimary, flex: 1 }}
          >
            <EditIcon />
            Edit Expected
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onCancel}
              style={{ ...btnOutline, flex: 1 }}
            >
              <CancelIcon />
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              style={{ ...btnPrimary, flex: 1, opacity: saving ? 0.65 : 1 }}
              disabled={saving}
            >
              <SaveIcon />
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        )}
      </div>

      {/* Space cards */}
      {rows.map((row, idx) => (
        <SpaceCard
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

      {/* Totals summary */}
      {rows.length > 0 && <TotalsSummaryCard totals={totals} />}
    </div>
  );
}
