import React from "react";

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 10,
};

const titleStyle = {
  fontSize: 13,
  fontWeight: 900,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

export default function PaymentSectionHeader({ title, action = null }) {
  return (
    <div style={headerRowStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={titleStyle}>{title}</span>
      </div>
      {action}
    </div>
  );
}

