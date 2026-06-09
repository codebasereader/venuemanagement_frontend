import React from "react";
import { Empty } from "antd";
import { formatDayLabel, formatINR } from "../daybookHelpers.js";

const sectionStyle = {
  marginBottom: 32,
};

const titleStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#1a1917",
  marginBottom: 16,
  fontFamily: "'DM Sans', sans-serif",
};

const wrapperStyle = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 12,
  border: "1px solid #ece9e4",
};

const tableStyle = {
  width: "100%",
  minWidth: 640,
  borderCollapse: "collapse",
  background: "white",
  fontSize: 13,
  fontFamily: "'DM Sans', sans-serif",
};

const thStyle = {
  padding: "12px 14px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 11,
  color: "#8a8580",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  background: "#faf9f7",
  borderBottom: "1px solid #ece9e4",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 14px",
  borderBottom: "1px solid #f1f0ee",
  verticalAlign: "middle",
  color: "#1a1917",
};

function DailyRow({ row, index, maxAbsNet }) {
  const barWidth = maxAbsNet > 0 ? Math.round((Math.abs(row.net) / maxAbsNet) * 100) : 0;
  const isPositive = row.net >= 0;

  return (
    <tr style={{ background: index % 2 === 0 ? "#fff" : "#fdfcfb" }}>
      <td style={{ ...tdStyle, fontWeight: 600, minWidth: 160 }}>
        {formatDayLabel(row.date)}
      </td>
      <td style={{ ...tdStyle, color: "#2e7d32", fontWeight: 700 }}>
        {formatINR(row.inflowTotal)}
      </td>
      <td style={{ ...tdStyle, color: "#c62828", fontWeight: 700 }}>
        {formatINR(row.outflowTotal)}
      </td>
      <td
        style={{
          ...tdStyle,
          fontWeight: 900,
          color: isPositive ? "#1565c0" : "#c62828",
          whiteSpace: "nowrap",
        }}
      >
        {formatINR(row.net)}
      </td>
      <td style={{ ...tdStyle, minWidth: 180 }}>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "#f1f0ee",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barWidth}%`,
              height: "100%",
              borderRadius: 4,
              background: isPositive ? "#4caf50" : "#ef5350",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </td>
    </tr>
  );
}

export const DaybookDailyBreakdown = ({ rows = [] }) => {
  if (!rows.length) {
    return (
      <div style={sectionStyle}>
        <div style={titleStyle}>Daily Breakdown</div>
        <Empty description="No daily data for this range" />
      </div>
    );
  }

  const maxAbsNet = Math.max(...rows.map((r) => Math.abs(r.net || 0)), 1);

  return (
    <div style={sectionStyle}>
      <div style={titleStyle}>Daily Breakdown</div>
      <div style={wrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={{ ...thStyle, color: "#2e7d32" }}>Inflow</th>
              <th style={{ ...thStyle, color: "#c62828" }}>Outflow</th>
              <th style={thStyle}>Net</th>
              <th style={thStyle}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <DailyRow
                key={row.date}
                row={row}
                index={index}
                maxAbsNet={maxAbsNet}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DaybookDailyBreakdown;
