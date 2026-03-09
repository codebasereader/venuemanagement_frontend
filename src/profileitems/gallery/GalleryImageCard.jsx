import React from "react";

const TrashIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function GalleryImageCard({ imageUrl, onDelete }) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#f5f4f1",
      }}
    >
      <img
        src={imageUrl}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        aria-label="Delete image"
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          border: "none",
          background: "rgba(26, 25, 23, 0.75)",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26, 25, 23, 0.9)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(26, 25, 23, 0.75)")}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
