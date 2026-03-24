import React from "react";

const TAB_ITEMS = [
  { key: "commissions", label: "Commissions" },
  { key: "labours", label: "Labours" },
];

export default function LabourTabs({ activeKey, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        overflowX: "auto",
        paddingBottom: 6,
      }}
    >
      {TAB_ITEMS.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.(tab.key)}
            style={{
              border: "none",
              cursor: "pointer",
              flex: "0 0 auto",
              padding: "8px 12px",
              borderRadius: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 800,
              fontSize: 12,
              background: active ? "#1a1917" : "#f0ede8",
              color: active ? "white" : "#1a1917",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
