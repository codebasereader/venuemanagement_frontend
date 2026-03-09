import React, { useRef } from "react";

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

export default function UploadImagesModal({ isOpen, onClose, onSelectFiles }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onSelectFiles(files);
    e.target.value = "";
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
          maxWidth: "360px",
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: 700,
            color: "#1a1917",
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          Add images
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#6b6966", fontFamily: "'DM Sans', sans-serif" }}>
          Choose multiple images to add to this album.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleChange}
        />
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ ...btnBase, background: "#f5f4f1", color: "#1a1917" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e6e2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f4f1")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{ ...btnBase, background: GOLD, color: "white" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b8963a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
          >
            Choose images
          </button>
        </div>
      </div>
    </div>
  );
}
