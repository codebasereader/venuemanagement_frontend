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

const readOnlyInputStyle = {
  ...inputStyle,
  background: "#f5f4f1",
  color: "#6b6966",
  cursor: "not-allowed",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "100px",
  resize: "vertical",
};

export default function BasicInfoCard({ venueName = "", tagline = "", description = "", onChange }) {
  return (
    <SectionCard>
      <label style={labelStyle}>
        Venue Name
        <input
          type="text"
          placeholder="Venue name"
          value={venueName}
          readOnly
          style={readOnlyInputStyle}
        />
      </label>
      <label style={labelStyle}>
        Tagline
        <input
          type="text"
          placeholder="Short tagline for your venue"
          value={tagline}
          onChange={(e) => onChange?.({ tagline: e.target.value })}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Description
        <textarea
          placeholder="Describe your venue"
          value={description}
          onChange={(e) => onChange?.({ description: e.target.value })}
          style={textareaStyle}
        />
      </label>
    </SectionCard>
  );
}
