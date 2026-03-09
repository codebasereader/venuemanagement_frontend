import React from "react";

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const iconBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  transition: "background 0.15s",
  flexShrink: 0,
};

export default function ContactCard({ contact, onEdit, onDelete }) {
  const { name, designation, number } = contact;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "14px 16px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: 600,
            color: "#1a1917",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {name}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "13px",
            color: "#9a9896",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {designation}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "13px",
            color: "#1a1917",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {number}
        </p>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={() => onEdit(contact)}
          aria-label="Edit contact"
          style={{
            ...iconBtnStyle,
            background: "#fdf6e8",
            color: "#b8923d",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f9ebc8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fdf6e8")}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={() => onDelete(contact)}
          aria-label="Delete contact"
          style={{
            ...iconBtnStyle,
            background: "#fde8e6",
            color: "#d94f3d",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fbd0cc")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fde8e6")}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
