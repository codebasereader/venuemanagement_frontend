import React, { useState, useEffect, useRef } from "react";

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
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setAlbumName("");
      setDescription("");
      setCoverFile(null);
      setCoverPreview(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = albumName.trim();
    if (!name) return;
    onSave({ name, description: description.trim() || undefined, coverFile: coverFile || undefined });
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setCoverFile(file || null);
    e.target.value = "";
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
          maxHeight: "90vh",
          overflow: "auto",
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
              placeholder="e.g. Wedding Events, Corporate"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              style={inputStyle}
              required
              autoFocus
            />
          </label>
          <label style={labelStyle}>
            Description
            <textarea
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }}
              rows={3}
            />
          </label>
          <label style={labelStyle}>
            Cover image
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div style={{ marginBottom: 16 }}>
              {coverPreview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{
                      width: "100%",
                      maxHeight: 160,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid #e8e6e2",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                      fileInputRef.current?.value && (fileInputRef.current.value = "");
                    }}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: "rgba(26,25,23,0.8)",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%",
                    padding: "24px",
                    borderRadius: 10,
                    border: "1px dashed #e8e6e2",
                    background: "#faf9f7",
                    color: "#6b6966",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                  }}
                >
                  Choose cover image (optional)
                </button>
              )}
            </div>
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
