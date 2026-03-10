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

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function AlbumCard({ album, onClick, onDelete }) {
  // API: coverImage; legacy/local: first of images array
  const coverUrl = album.coverImage || (album.images && album.images[0]) || (album.photos?.[0]?.url);
  const count = album.photoCount ?? (album.photos?.length ?? album.images?.length ?? 0);
  const PlaceholderIcon = placeholderIcons[Math.abs(album.name?.length || 0) % placeholderIcons.length];

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "12px",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee",
        overflow: "hidden",
        textAlign: "left",
        fontFamily: "'DM Sans', sans-serif",
        transition: "box-shadow 0.15s, transform 0.15s",
        position: "relative",
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
      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          padding: 0,
          border: "none",
          background: "none",
          cursor: "pointer",
          textAlign: "left",
          font: "inherit",
          color: "inherit",
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
            position: "relative",
          }}
        >
          {onDelete && (
            <button
              type="button"
              aria-label="Delete album"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete();
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                background: "rgba(26,25,23,0.75)",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrashIcon />
            </button>
          )}
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
    </div>
  );
}
