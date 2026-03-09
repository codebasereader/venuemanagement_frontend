import React, { useState } from "react";
import ImageCarousel from "./ImageCarousel";

const GuestsIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DimensionIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const GalleryIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const EditIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const iconBtnStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  border: "none",
  background: "#f5f4f1",
  color: "#6b6966",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "background 0.15s, color 0.15s",
};

export default function SpaceCard({ space, onEdit, onDelete }) {
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const images = space.images && space.images.length ? space.images : [];

  return (
    <>
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px #f1f0ee",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <ImageCarousel images={images} alt={space.spaceName} />

        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <h3
            style={{
              margin: "0 0 10px 0",
              fontSize: "17px",
              fontWeight: 700,
              color: "#1a1917",
              fontFamily: "'DM Serif Display', Georgia, serif",
              letterSpacing: "-0.01em",
            }}
          >
            {space.spaceName || "Unnamed space"}
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "13px", color: "#6b6966" }}>
              {space.maxGuests && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <GuestsIcon />
                  {space.maxGuests} guests
                </span>
              )}
              {space.dimension && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <DimensionIcon />
                  {space.dimension}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {images.length > 0 && (
                <button
                  type="button"
                  title="View images"
                  style={iconBtnStyle}
                  onClick={() => images.length > 0 && setShowCarouselModal(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e8e6e2";
                    e.currentTarget.style.color = "#1a1917";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f5f4f1";
                    e.currentTarget.style.color = "#6b6966";
                  }}
                >
                  <GalleryIcon />
                </button>
              )}
              <button
                type="button"
                title="Edit"
                style={iconBtnStyle}
                onClick={() => onEdit(space)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e8e6e2";
                  e.currentTarget.style.color = "#1a1917";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f4f1";
                  e.currentTarget.style.color = "#6b6966";
                }}
              >
                <EditIcon />
              </button>
              <button
                type="button"
                title="Delete"
                style={{ ...iconBtnStyle, color: "#d94f3d" }}
                onClick={() => onDelete(space)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fde8e6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f5f4f1";
                }}
              >
                <DeleteIcon />
              </button>
            </div>
          </div>

          {space.description && (
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#6b6966",
                lineHeight: 1.45,
              }}
            >
              {space.description}
            </p>
          )}
        </div>
      </div>

      {showCarouselModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(26,25,23,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowCarouselModal(false)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowCarouselModal(false)}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "85vh", width: "100%" }}>
            <ImageCarousel images={images} alt={space.spaceName} style={{ borderRadius: "12px" }} />
          </div>
        </div>
      )}
    </>
  );
}
