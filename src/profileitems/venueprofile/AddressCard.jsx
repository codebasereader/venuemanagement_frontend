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

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: "12px",
};

export default function AddressCard() {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  return (
    <SectionCard>
      <label style={labelStyle}>
        Street Address
        <input
          type="text"
          placeholder="Street address"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          style={inputStyle}
        />
      </label>
      <div style={rowStyle}>
        <label style={labelStyle}>
          City
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          State
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Pincode
          <input
            type="text"
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>
      <label style={labelStyle}>
        Google Map URL
        <input
          type="url"
          placeholder="https://maps.google.com/..."
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
      </label>
    </SectionCard>
  );
}
