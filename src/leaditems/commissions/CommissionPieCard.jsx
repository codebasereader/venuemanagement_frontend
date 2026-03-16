import React from "react";
import { formatINR } from "../quotes/quoteMath.js";

const cardStyle = {
  background: "white",
  borderRadius: 16,
  border: "1px solid #ece9e4",
  padding: 16,
};

const titleStyle = {
  fontSize: 13,
  fontWeight: 900,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
  marginBottom: 10,
};

export default function CommissionPieCard({ outflowTotal = 0, inflowTotal = 0 }) {
  const outflow = Number(outflowTotal) || 0;
  const inflow = Number(inflowTotal) || 0;
  const total = outflow + inflow;

  const outflowPercent = total > 0 ? (outflow / total) * 100 : 0;
  const inflowPercent = total > 0 ? (inflow / total) * 100 : 0;

  // Simple donut using conic-gradient
  const gradient =
    total === 0
      ? "#f0ede8"
      : `conic-gradient(#d9534f 0 ${outflowPercent}%, #4caf50 ${outflowPercent}% 100%)`;

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Commission summary</div>
      <div style={{ borderTop: "1px solid #f1f0ee" }} />

      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            backgroundImage: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: "#6b6966",
              textAlign: "center",
              padding: 4,
              boxSizing: "border-box",
            }}
          >
            {total === 0 ? "No data" : `Net ${formatINR(inflow - outflow)}`}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 6,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#d9534f",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#6b6966", fontWeight: 700 }}>
              Outflow (paid):
            </span>
            <span style={{ color: "#1a1917", fontWeight: 800 }}>
              {formatINR(outflow)}{" "}
              {total > 0 && `(${outflowPercent.toFixed(0)}%)`}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#4caf50",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#6b6966", fontWeight: 700 }}>
              Inflow (received):
            </span>
            <span style={{ color: "#1a1917", fontWeight: 800 }}>
              {formatINR(inflow)}{" "}
              {total > 0 && `(${inflowPercent.toFixed(0)}%)`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

