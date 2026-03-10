import React from "react";
import SectionCard from "./SectionCard";

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #e8e6e2",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "#1a1917",
  background: "white",
  marginBottom: "16px",
  boxSizing: "border-box",
};

export default function LegalCard({ legal = {}, onChange }) {
  const businessName = legal?.businessName ?? legal?.legalName ?? "";
  const gst = legal?.gst ?? "";

  return (
    <SectionCard>
      <label style={labelStyle}>
        Legal Business Name
        <input
          type="text"
          placeholder="Registered business name"
          value={businessName}
          onChange={(e) =>
            onChange?.({ legal: { ...legal, businessName: e.target.value } })
          }
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        GST
        <input
          type="text"
          placeholder="GST number"
          value={gst}
          onChange={(e) => onChange?.({ legal: { ...legal, gst: e.target.value } })}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
      </label>
    </SectionCard>
  );
}
