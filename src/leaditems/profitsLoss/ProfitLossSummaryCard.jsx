import React from "react";
import { formatINR, pctOf } from "./profitLossMath.js";

function Row({ label, amount, baseAmount, color = "#1a1917" }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#6b6966", fontWeight: 700 }}>{label}</span>
      <span style={{ color, fontWeight: 900, textAlign: "right" }}>
        {formatINR(amount)} ({pctOf(baseAmount, amount)}%)
      </span>
    </div>
  );
}

export default function ProfitLossSummaryCard({
  title,
  quoteTotal,
  outflowPaid,
  labourCost,
  inflowReceived,
  net,
}) {
  const netPositive = net >= 0;
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #ece9e4",
        padding: 16,
      }}
    >
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 900,
          color: "#1a1917",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <Row label="Confirmed quote total" amount={quoteTotal} baseAmount={quoteTotal} />
        <Row label="Outflow (paid)" amount={outflowPaid} baseAmount={quoteTotal} color="#a33b2d" />
        <Row label="Labours" amount={labourCost} baseAmount={quoteTotal} color="#a33b2d" />
        <Row label="Inflow (received)" amount={inflowReceived} baseAmount={quoteTotal} color="#17634a" />
      </div>
      <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 10, paddingTop: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
          }}
        >
          <span style={{ color: "#1a1917", fontWeight: 900 }}>Net {netPositive ? "Profit" : "Loss"}</span>
          <span style={{ color: netPositive ? "#17634a" : "#a33b2d", fontWeight: 900 }}>
            {netPositive ? "+" : "-"}{formatINR(Math.abs(net))}
          </span>
        </div>
      </div>
    </div>
  );
}
