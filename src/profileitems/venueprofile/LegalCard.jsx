import React, { useState } from "react";
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

export default function LegalCard() {
  const [legalName, setLegalName] = useState("");
  const [gst, setGst] = useState("");
  const [pan, setPan] = useState("");

  return (
    <SectionCard>
      <label style={labelStyle}>
        Legal Business Name
        <input
          type="text"
          placeholder="Registered business name"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        GST
        <input
          type="text"
          placeholder="GST number"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        PAN
        <input
          type="text"
          placeholder="PAN number"
          value={pan}
          onChange={(e) => setPan(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
      </label>
    </SectionCard>
  );
}
