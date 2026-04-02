import React from "react";
import { MONTH_NAMES, YEAR_OPTIONS } from "../utils/targetHelpers";
import { FONT, selectStyle } from "../utils/targetStyles";

/**
 * Month + Year selector row.
 * Props:
 *   month, year           — currently selected values
 *   onMonthChange(m)      — called with new month number (1-12)
 *   onYearChange(y)       — called with new year number
 *   showMonth             — whether to show month selector (false for yearly view)
 *   disabled              — disables both selects
 */
export default function PeriodSelector({
  month,
  year,
  onMonthChange,
  onYearChange,
  showMonth = true,
  disabled = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      {showMonth && (
        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          style={selectStyle}
          disabled={disabled}
          aria-label="Select month"
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={i + 1} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
      )}
      <select
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        style={selectStyle}
        disabled={disabled}
        aria-label="Select year"
      >
        {YEAR_OPTIONS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
