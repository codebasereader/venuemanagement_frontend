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

const textareaStyle = {
  ...inputStyle,
  minHeight: "100px",
  resize: "vertical",
};

export default function BasicInfoCard() {
  const [venueName, setVenueName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  return (
    <SectionCard>
      <label style={labelStyle}>
        Venue Name
        <input
          type="text"
          placeholder="Enter venue name"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Tagline
        <input
          type="text"
          placeholder="Short tagline for your venue"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Description
        <textarea
          placeholder="Describe your venue"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={textareaStyle}
        />
      </label>
    </SectionCard>
  );
}
