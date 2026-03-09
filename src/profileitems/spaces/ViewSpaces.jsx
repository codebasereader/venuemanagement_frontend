import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddSpaceModal from "./AddSpaceModal";
import SpaceCard from "./SpaceCard";

const ChevronLeftIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const VENUE_SPACES_KEY = "venue-spaces";

export default function ViewSpaces() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VENUE_SPACES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSpaces(parsed);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(VENUE_SPACES_KEY, JSON.stringify(spaces));
    } catch (_) {}
  }, [spaces]);

  const handleSave = useCallback(async (payload) => {
    const images = await Promise.all(
      (payload.images || []).map((img) => (typeof img === "string" ? img : fileToDataUrl(img)))
    );
    const data = {
      ...payload,
      images,
      id: payload.id || `space-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    if (payload.id) {
      setSpaces((prev) => prev.map((s) => (s.id === payload.id ? { ...s, ...data } : s)));
    } else {
      setSpaces((prev) => [...prev, data]);
    }
    setModalOpen(false);
    setEditingSpace(null);
  }, []);

  const handleEdit = useCallback((space) => {
    setEditingSpace(space);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((space) => {
    if (window.confirm(`Delete "${space.spaceName || "this space"}"?`)) {
      setSpaces((prev) => prev.filter((s) => s.id !== space.id));
    }
  }, []);

  const openAddModal = useCallback(() => {
    setEditingSpace(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingSpace(null);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header: back + title + add */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              aria-label="Back to Profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: "none",
                background: "#f5f4f1",
                color: "#1a1917",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e6e2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f4f1")}
            >
              <ChevronLeftIcon />
            </button>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(22px, 4vw, 26px)",
                fontWeight: 700,
                color: "#1a1917",
                fontFamily: "'DM Serif Display', Georgia, serif",
                letterSpacing: "-0.02em",
              }}
            >
              Spaces
            </h1>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#1a1917",
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3d3b38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1917")}
          >
            <PlusIcon />
            Add
          </button>
        </div>

        {/* Grid: responsive 1 col mobile, 2 col tablet+ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
          }}
        >
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {spaces.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#faf9f7",
              borderRadius: "16px",
              border: "1px dashed #e8e6e2",
            }}
          >
            <p style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 600, color: "#6b6966" }}>
              No spaces yet
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9a9896" }}>
              Add your first space to get started.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              style={{
                marginTop: "16px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: "#1a1917",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add Space
            </button>
          </div>
        )}
      </div>

      <AddSpaceModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editSpace={editingSpace}
      />
    </>
  );
}
