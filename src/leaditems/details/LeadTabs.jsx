import React from "react";

export const LEAD_TABS = [
  { key: "details", label: "Details" },
  { key: "quotes", label: "Quotes" },
  { key: "payments", label: "Payments" },
];

export default function LeadTabs({ activeKey, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        overflowX: "auto",
        paddingBottom: 6,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`
        .lead-tabs::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="lead-tabs" style={{ display: "flex", gap: 10 }}>
        {LEAD_TABS.map((t) => {
          const active = t.key === activeKey;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange?.(t.key)}
              style={{
                border: "none",
                cursor: "pointer",
                flex: "0 0 auto",
                padding: "10px 14px",
                borderRadius: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                background: active ? "#1a1917" : "#f0ede8",
                color: active ? "white" : "#1a1917",
                transition: "background 0.15s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

