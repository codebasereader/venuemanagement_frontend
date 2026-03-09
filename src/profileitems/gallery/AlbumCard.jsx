import React from "react";

const FolderIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const StarIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BubbleIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const placeholderIcons = [FolderIcon, StarIcon, BubbleIcon];

export default function AlbumCard({ album, onClick }) {
  const images = album.images || [];
  const count = images.length;
  const coverUrl = images[0];
  const PlaceholderIcon = placeholderIcons[Math.abs(album.name?.length || 0) % placeholderIcons.length];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: 0,
        border: "none",
        borderRadius: "12px",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "'DM Sans', sans-serif",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px #e8e6e2";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          aspectRatio: "4/3",
          background: "#faf9f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <PlaceholderIcon />
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#1a1917",
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {album.name || "Untitled"}
        </div>
        <div style={{ fontSize: "13px", color: "#6b6966" }}>
          {count === 1 ? "1 image" : `${count} images`}
        </div>
      </div>
    </button>
  );
}
