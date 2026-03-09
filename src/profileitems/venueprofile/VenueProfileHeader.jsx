import React from "react";
import { useNavigate } from "react-router-dom";

const BackIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function VenueProfileHeader() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/profile")}
        aria-label="Back to Profile"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          border: "1px solid #e8e6e2",
          background: "white",
          color: "#1a1917",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee",
          transition: "background 0.15s, transform 0.1s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f5f4f1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white";
        }}
      >
        <BackIcon />
      </button>
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(22px, 5vw, 28px)",
          fontWeight: 700,
          color: "#1a1917",
          fontFamily: "'DM Serif Display', Georgia, serif",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        Venue Profile
      </h1>
    </div>
  );
}
