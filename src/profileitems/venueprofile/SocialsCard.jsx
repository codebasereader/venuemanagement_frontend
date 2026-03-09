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

export default function SocialsCard() {
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  return (
    <SectionCard>
      <label style={labelStyle}>
        Instagram
        <input
          type="url"
          placeholder="https://instagram.com/..."
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Facebook
        <input
          type="url"
          placeholder="https://facebook.com/..."
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Email
        <input
          type="email"
          placeholder="venue@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Website
        <input
          type="url"
          placeholder="https://..."
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
      </label>
    </SectionCard>
  );
}
