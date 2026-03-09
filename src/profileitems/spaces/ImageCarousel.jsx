import React, { useState, useEffect } from "react";

export default function ImageCarousel({ images = [], alt = "Space", style = {} }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  if (!count) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "16/10",
          background: "#f0ede8",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9a9896",
          fontSize: "14px",
          fontFamily: "'DM Sans', sans-serif",
          ...style,
        }}
      >
        No image
      </div>
    );
  }

  const src = images[index];
  const url = typeof src === "string" ? src : (src && typeof src === "object" && src instanceof File ? URL.createObjectURL(src) : null);

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        borderRadius: "12px 12px 0 0",
        overflow: "hidden",
        background: "#f0ede8",
        ...style,
      }}
    >
      <div style={{ width: "100%", aspectRatio: "16/10", position: "relative" }}>
        <img
          src={url}
          alt={`${alt} ${index + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setIndex((i) => (i === 0 ? count - 1 : i - 1))}
              style={{
                position: "absolute",
                left: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1a1917",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setIndex((i) => (i === count - 1 ? 0 : i + 1))}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1a1917",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "6px",
              }}
            >
              {images.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === index ? "14px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: i === index ? "white" : "rgba(255,255,255,0.5)",
                    transition: "width 0.2s, background 0.2s",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
