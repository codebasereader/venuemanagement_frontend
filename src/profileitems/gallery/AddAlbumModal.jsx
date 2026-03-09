import React, { useState, useEffect } from "react";

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

const btnBase = {
  padding: "10px 20px",
  borderRadius: "10px",
  border: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.15s",
};

const GOLD = "#c9a84c";

export default function AddAlbumModal({ isOpen, onClose, onSave }) {
  const [albumName, setAlbumName] = useState("");

  useEffect(() => {
    if (isOpen) setAlbumName("");
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = albumName.trim();
    if (!name) return;
    onSave(name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(26, 25, 23, 0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px #f1f0ee",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: "0 0 20px 0",
            fontSize: "18px",
            fontWeight: 700,
            color: "#1a1917",
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          Add Album
        </h3>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Album Name
            <input
              type="text"
              placeholder="e.g. Decorated, Events"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              style={inputStyle}
              required
              autoFocus
            />
          </label>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                ...btnBase,
                background: "#f5f4f1",
                color: "#1a1917",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e6e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f4f1")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!albumName.trim()}
              style={{
                ...btnBase,
                background: albumName.trim() ? GOLD : "#d8d5d0",
                color: "white",
              }}
              onMouseEnter={(e) => {
                if (albumName.trim()) e.currentTarget.style.background = "#b8963a";
              }}
              onMouseLeave={(e) => {
                if (albumName.trim()) e.currentTarget.style.background = GOLD;
              }}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
