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

export default function PaymentProgressCard({ totalAmount = 0, collectedAmount = 0 }) {
  const total = Number(totalAmount) || 0;
  const collected = Number(collectedAmount) || 0;
  const pending = Math.max(0, total - collected);
  const percent = total > 0 ? Math.min(100, Math.round((collected / total) * 100)) : 0;

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>Payment progress</div>
      <div style={{ borderTop: "1px solid #f1f0ee" }} />
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, color: "#1a1917", fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>
          {percent}% paid
        </span>
        <span style={{ fontSize: 14, color: "#c9a84c", fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>
          {formatINR(pending)} pending
        </span>
      </div>
      <div
        style={{
          marginTop: 8,
          height: 10,
          borderRadius: 999,
          background: "#f0ede8",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            borderRadius: 999,
            background: "#c9a84c",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "#6b6966",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
        }}
      >
        Collected: {formatINR(collected)} of {formatINR(total)}
      </div>
    </div>
  );
}
