import React, { useEffect, useRef, useState } from "react";
import SectionCard from "./SectionCard";

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const inputStyle = {
  display: "none",
};

const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
};

export default function VenueLogoUpload({ logo = "", onChange, onFileSelect }) {
  const [preview, setPreview] = useState(logo || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => {
    setPreview(logo || null);
  }, [logo]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (onFileSelect) {
      setUploading(true);
      try {
        await onFileSelect(file);
      } finally {
        setUploading(false);
      }
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.({ logo: url });
  };

  const handleEdit = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onChange?.({ logo: "" });
  };

  return (
    <SectionCard>
      {uploading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "32px 24px",
            border: "2px dashed #e8e6e2",
            borderRadius: "12px",
            background: "#faf9f7",
            color: "#9a9896",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span>Uploading…</span>
        </div>
      ) : !preview ? (
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "32px 24px",
            border: "2px dashed #e8e6e2",
            borderRadius: "12px",
            background: "#faf9f7",
            cursor: "pointer",
            color: "#9a9896",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#c9a84c";
            e.currentTarget.style.background = "#fdf6e8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e8e6e2";
            e.currentTarget.style.background = "#faf9f7";
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={inputStyle}
          />
          <UploadIcon />
          <span>Click to upload venue logo</span>
        </label>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#f5f4f1",
              flexShrink: 0,
            }}
          >
            <img
              src={preview}
              alt="Venue logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={handleEdit}
              style={{
                ...btnBase,
                background: "#fdf6e8",
                color: "#b8923d",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9ebc8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fdf6e8";
              }}
            >
              <EditIcon /> Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                ...btnBase,
                background: "#fde8e6",
                color: "#d94f3d",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fbd0cc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fde8e6";
              }}
            >
              <TrashIcon /> Delete
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
