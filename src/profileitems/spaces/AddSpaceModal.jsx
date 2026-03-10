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

const MAX_IMAGES = 5;

function ImageSlot({ value, onChange, onRemove, index, canRemove }) {
  const inputRef = useRef(null);
  const url = value && typeof value === "object" && value instanceof File
    ? URL.createObjectURL(value)
    : typeof value === "string" ? value : null;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100px",
        borderRadius: "10px",
        border: "1px dashed #e8e6e2",
        background: value ? "transparent" : "#faf9f7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginBottom: "8px",
        position: "relative",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && file.type.startsWith("image/")) onChange(file, index);
          e.target.value = "";
        }}
      />
      {value ? (
        <>
          <img
            src={url}
            alt={`Space ${index + 1}`}
            style={{ width: "100%", height: "100px", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", top: "6px", right: "6px", display: "flex", gap: "4px" }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                width: "28px", height: "28px", borderRadius: "8px", border: "none",
                background: "rgba(255,255,255,0.9)", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
              title="Change image"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            {canRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                style={{
                  width: "28px", height: "28px", borderRadius: "8px", border: "none",
                  background: "rgba(253,232,230,0.95)", color: "#d94f3d", cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
                title="Remove image"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            )}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: "100%", height: "100%", border: "none", background: "transparent",
            cursor: "pointer", fontSize: "13px", color: "#9a9896", fontFamily: "'DM Sans', sans-serif",
          }}
        >
          + Add image {index + 1}
        </button>
      )}
    </div>
  );
}

export default function AddSpaceModal({ isOpen, onClose, onSave, editSpace = null }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [images, setImages] = useState(() => Array(MAX_IMAGES).fill(null));

  const isEdit = Boolean(editSpace);

  useEffect(() => {
    if (editSpace) {
      setName(editSpace.name ?? editSpace.spaceName ?? "");
      setDescription(editSpace.description ?? "");
      setCapacity(editSpace.capacity != null ? String(editSpace.capacity) : "");
      setDimensions(editSpace.dimensions ?? editSpace.dimension ?? editSpace.metadata?.dimension ?? "");
      const imgs = [...(editSpace.images || [])];
      while (imgs.length < MAX_IMAGES) imgs.push(null);
      setImages(imgs.slice(0, MAX_IMAGES));
    } else {
      setName("");
      setDescription("");
      setCapacity("");
      setDimensions("");
      setImages(Array(MAX_IMAGES).fill(null));
    }
  }, [editSpace, isOpen]);

  const setImageAt = (file, index) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const removeImageAt = (index) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const imageCount = images.filter(Boolean).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      capacity: capacity.trim() === "" ? undefined : Number(capacity),
      dimensions: dimensions.trim() || undefined,
      images: images.filter(Boolean),
    };
    if (editSpace?._id) payload._id = editSpace._id;
    onSave(payload);
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
          maxWidth: "440px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
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
          {isEdit ? "Edit Space" : "Add Space"}
        </h3>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Images (optional — S3 upload coming later)</label>
          {Array.from({ length: MAX_IMAGES }, (_, i) => (
            <ImageSlot
              key={i}
              index={i}
              value={images[i]}
              onChange={setImageAt}
              onRemove={removeImageAt}
              canRemove={imageCount > 1}
            />
          ))}

          <label style={labelStyle}>
            Space name <span style={{ color: "#d94f3d" }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Main Hall"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <label style={labelStyle}>Description</label>
          <textarea
            placeholder="Brief description of the space"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            rows={3}
          />

          <label style={labelStyle}>Capacity (e.g. seats)</label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 200"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Dimensions</label>
          <input
            type="text"
            placeholder="e.g. 40ft x 60ft"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            style={inputStyle}
          />

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
              style={{
                ...btnBase,
                background: "#1a1917",
                color: "white",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#3d3b38")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1917")}
            >
              {isEdit ? "Update" : "Add Space"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
