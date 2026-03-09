import React from "react";

export default function BuyoutOnlyToggle({ checked = false, onChange, label, description }) {
  return (
    <div
      style={{
        background: "#faf9f7",
        border: "1px solid #e8e6e2",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            color: "#1a1917",
          }}
        >
          {label}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange?.(!checked)}
          style={{
            width: "48px",
            height: "28px",
            borderRadius: "14px",
            border: "none",
            background: checked ? "#c9a84c" : "#e8e6e2",
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "4px",
              left: checked ? "24px" : "4px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "left 0.2s",
            }}
          />
        </button>
      </div>
      {description && (
        <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#6b6966", lineHeight: 1.4 }}>
          {description}
        </p>
      )}
    </div>
  );
}
