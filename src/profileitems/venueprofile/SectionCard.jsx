import React from "react";

const cardStyle = {
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee",
  padding: "20px",
  width: "100%",
  maxWidth: "100%",
};

export function SectionLabel({ children }) {
  return (
    <p
      style={{
        margin: "0 0 10px 4px",
        fontSize: "11px",
        fontWeight: 700,
        color: "#9a9896",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </p>
  );
}

export default function SectionCard({ children, style = {} }) {
  return <div style={{ ...cardStyle, ...style }}>{children}</div>;
}
