import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddAlbumModal from "./AddAlbumModal";
import UploadImagesModal from "./UploadImagesModal";
import AlbumCard from "./AlbumCard";
import GalleryImageCard from "./GalleryImageCard";

const GALLERY_STORAGE_KEY = "venue-gallery-albums";

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

const GOLD = "#c9a84c";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function GalleryHome() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [addAlbumModalOpen, setAddAlbumModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setAlbums(parsed);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(albums));
    } catch (_) {}
  }, [albums]);

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);
  const isAlbumView = Boolean(selectedAlbum);

  const handleAddAlbum = useCallback((name) => {
    const id = `album-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newAlbum = { id, name: name.trim(), images: [] };
    setAlbums((prev) => [...prev, newAlbum]);
    setAddAlbumModalOpen(false);
    setSelectedAlbumId(id);
  }, []);

  const handleAlbumClick = useCallback((album) => {
    setSelectedAlbumId(album.id);
  }, []);

  const handleBackFromAlbum = useCallback(() => {
    setSelectedAlbumId(null);
  }, []);

  const handleAddImages = useCallback(
    async (files) => {
      if (!selectedAlbumId || !files.length) return;
      const urls = await Promise.all(files.map(fileToDataUrl));
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === selectedAlbumId ? { ...a, images: [...(a.images || []), ...urls] } : a
        )
      );
      setUploadModalOpen(false);
    },
    [selectedAlbumId]
  );

  const handleDeleteImage = useCallback(
    (albumId, index) => {
      setAlbums((prev) =>
        prev.map((a) => {
          if (a.id !== albumId) return a;
          const next = [...(a.images || [])];
          next.splice(index, 1);
          return { ...a, images: next };
        })
      );
    },
    []
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          fontFamily: "'DM Sans', sans-serif",
          padding: "0 8px 24px",
        }}
      >
        {/* Header: back (in album view) + title + action button */}
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
            {isAlbumView && (
              <button
                type="button"
                onClick={handleBackFromAlbum}
                aria-label="Back to Gallery"
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
            )}
            {!isAlbumView && (
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
            )}
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(22px, 4vw, 26px)",
                fontWeight: 700,
                color: "#1a1917",
                fontFamily: "'DM Serif Display', Georgia, serif",
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isAlbumView ? selectedAlbum?.name || "Album" : "Gallery"}
            </h1>
          </div>
          {isAlbumView ? (
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: GOLD,
                color: "white",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b8963a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
            >
              <PlusIcon />
              Add
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAddAlbumModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: GOLD,
                color: "white",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b8963a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
            >
              <PlusIcon />
              Add Album
            </button>
          )}
        </div>

        {/* Content */}
        {!isAlbumView && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}
          >
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} onClick={() => handleAlbumClick(album)} />
            ))}
          </div>
        )}

        {!isAlbumView && albums.length === 0 && (
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
              No albums yet
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9a9896" }}>
              Create an album to start adding images.
            </p>
            <button
              type="button"
              onClick={() => setAddAlbumModalOpen(true)}
              style={{
                marginTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: GOLD,
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <PlusIcon />
              Add Album
            </button>
          </div>
        )}

        {isAlbumView && selectedAlbum && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {(selectedAlbum.images || []).map((url, index) => (
              <GalleryImageCard
                key={`${selectedAlbum.id}-${index}`}
                imageUrl={url}
                onDelete={() => handleDeleteImage(selectedAlbum.id, index)}
              />
            ))}
          </div>
        )}

        {isAlbumView && selectedAlbum && (!selectedAlbum.images || selectedAlbum.images.length === 0) && (
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
              No images in this album
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#9a9896" }}>
              Tap Add to upload multiple images.
            </p>
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              style={{
                marginTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: GOLD,
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <PlusIcon />
              Add images
            </button>
          </div>
        )}
      </div>

      <AddAlbumModal
        isOpen={addAlbumModalOpen}
        onClose={() => setAddAlbumModalOpen(false)}
        onSave={handleAddAlbum}
      />
      <UploadImagesModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSelectFiles={handleAddImages}
      />
    </>
  );
}
