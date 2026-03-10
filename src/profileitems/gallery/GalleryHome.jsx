import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { message } from "antd";
import AddAlbumModal from "./AddAlbumModal";
import UploadImagesModal from "./UploadImagesModal";
import AlbumCard from "./AlbumCard";
import GalleryImageCard from "./GalleryImageCard";
import {
  listAlbums,
  getAlbumById,
  createAlbum,
  deleteAlbum,
  addPhotosToAlbum,
  deletePhoto,
} from "../../api/gallery";
import { listVenues } from "../../api/venue";
import { uploadImageToS3 } from "../../api/images";

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

/** Normalize album from API (_id → id for UI). */
function normalizeAlbum(album) {
  if (!album) return null;
  const id = album._id ?? album.id;
  if (!id) return null;
  return {
    ...album,
    id,
    coverImage: album.coverImage,
    photoCount: album.photoCount ?? (album.photos?.length ?? 0),
    photos: (album.photos ?? []).map((p) => ({
      ...p,
      id: p._id ?? p.id,
    })),
  };
}

/** Normalize list of albums. */
function normalizeAlbums(list) {
  const arr = Array.isArray(list) ? list : [];
  return arr.map(normalizeAlbum).filter(Boolean);
}

export default function GalleryHome() {
  const navigate = useNavigate();
  const { access_token: accessToken, role, venueId: myVenueId } = useSelector((s) => s.user.value);
  const isAdmin = role === "admin";

  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [addAlbumModalOpen, setAddAlbumModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [venueOptions, setVenueOptions] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(myVenueId ?? null);
  const [loading, setLoading] = useState(false);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  const effectiveVenueId = isAdmin ? selectedVenueId : myVenueId;

  // Load venue list for admin
  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    listVenues(accessToken)
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        const opts = arr.map((v) => ({
          value: v._id ?? v.id,
          label: v.name ?? v._id ?? v.id,
        }));
        setVenueOptions(opts);
        if (!selectedVenueId && opts[0]?.value) setSelectedVenueId(opts[0].value);
      })
      .catch(() => setVenueOptions([]));
  }, [accessToken, isAdmin, selectedVenueId]);

  const fetchAlbums = useCallback(async () => {
    if (!accessToken || !effectiveVenueId) return;
    setLoading(true);
    try {
      const data = await listAlbums(accessToken, effectiveVenueId);
      setAlbums(normalizeAlbums(data));
    } catch (err) {
      message.error(err?.response?.data?.message ?? err?.message ?? "Failed to load albums");
    } finally {
      setLoading(false);
    }
  }, [accessToken, effectiveVenueId]);

  useEffect(() => {
    if (isAdmin && !selectedVenueId) return;
    fetchAlbums();
  }, [fetchAlbums, isAdmin, selectedVenueId]);

  // When entering an album, fetch full album with photos
  const fetchAlbumDetail = useCallback(async () => {
    if (!accessToken || !effectiveVenueId || !selectedAlbumId) return;
    setAlbumLoading(true);
    try {
      const data = await getAlbumById(accessToken, effectiveVenueId, selectedAlbumId);
      setSelectedAlbum(normalizeAlbum(data));
    } catch (err) {
      message.error(err?.response?.data?.message ?? err?.message ?? "Failed to load album");
      setSelectedAlbum(null);
    } finally {
      setAlbumLoading(false);
    }
  }, [accessToken, effectiveVenueId, selectedAlbumId]);

  useEffect(() => {
    if (!selectedAlbumId) {
      setSelectedAlbum(null);
      return;
    }
    fetchAlbumDetail();
  }, [selectedAlbumId, fetchAlbumDetail]);

  const isAlbumView = Boolean(selectedAlbumId && selectedAlbum);

  const handleAddAlbum = useCallback(
    async (payload) => {
      if (!accessToken || !effectiveVenueId) {
        message.error("Venue not selected");
        return;
      }
      const { name, description, coverFile } = payload;
      setCreating(true);
      try {
        let coverImage;
        if (coverFile) {
          coverImage = await uploadImageToS3(accessToken, coverFile, effectiveVenueId);
        }
        await createAlbum(accessToken, effectiveVenueId, {
          name: name.trim(),
          ...(description && { description: description.trim() }),
          ...(coverImage && { coverImage }),
        });
        message.success("Album created");
        setAddAlbumModalOpen(false);
        await fetchAlbums();
        const list = await listAlbums(accessToken, effectiveVenueId);
        const normalized = normalizeAlbums(list);
        const created = normalized.find((a) => a.name === name.trim());
        if (created) setSelectedAlbumId(created.id);
      } catch (err) {
        message.error(err?.response?.data?.message ?? err?.message ?? "Failed to create album");
      } finally {
        setCreating(false);
      }
    },
    [accessToken, effectiveVenueId, fetchAlbums],
  );

  const handleAlbumClick = useCallback((album) => {
    setSelectedAlbumId(album.id);
  }, []);

  const handleBackFromAlbum = useCallback(() => {
    setSelectedAlbumId(null);
  }, []);

  const handleAddImages = useCallback(
    async (files) => {
      if (!accessToken || !effectiveVenueId || !selectedAlbumId || !files?.length) return;
      setUploading(true);
      try {
        const uploads = await Promise.all(
          files.map((file) => uploadImageToS3(accessToken, file, selectedAlbumId)),
        );
        const photos = uploads.map((url, i) => ({
          url,
          sortOrder: i,
        }));
        await addPhotosToAlbum(accessToken, effectiveVenueId, selectedAlbumId, { photos });
        message.success("Images added");
        setUploadModalOpen(false);
        await fetchAlbumDetail();
        await fetchAlbums();
      } catch (err) {
        message.error(err?.response?.data?.message ?? err?.message ?? "Failed to upload images");
      } finally {
        setUploading(false);
      }
    },
    [accessToken, effectiveVenueId, selectedAlbumId, fetchAlbumDetail, fetchAlbums],
  );

  const handleDeleteImage = useCallback(
    async (photoId) => {
      if (!accessToken || !effectiveVenueId || !selectedAlbumId || !photoId) return;
      setDeletingPhotoId(photoId);
      try {
        await deletePhoto(accessToken, effectiveVenueId, selectedAlbumId, photoId);
        message.success("Photo removed");
        await fetchAlbumDetail();
        await fetchAlbums();
      } catch (err) {
        message.error(err?.response?.data?.message ?? err?.message ?? "Failed to remove photo");
      } finally {
        setDeletingPhotoId(null);
      }
    },
    [accessToken, effectiveVenueId, selectedAlbumId, fetchAlbumDetail, fetchAlbums],
  );

  const handleDeleteAlbum = useCallback(
    async (albumId) => {
      if (!accessToken || !effectiveVenueId || !albumId) return;
      if (!window.confirm("Delete this album and all its photos?")) return;
      try {
        await deleteAlbum(accessToken, effectiveVenueId, albumId);
        message.success("Album deleted");
        if (selectedAlbumId === albumId) {
          setSelectedAlbumId(null);
          setSelectedAlbum(null);
        }
        await fetchAlbums();
      } catch (err) {
        message.error(err?.response?.data?.message ?? err?.message ?? "Failed to delete album");
      }
    },
    [accessToken, effectiveVenueId, selectedAlbumId, fetchAlbums],
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
          {effectiveVenueId && (
            <>
              {isAlbumView ? (
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  disabled={uploading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: uploading ? "#d8d5d0" : GOLD,
                    color: "white",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: uploading ? "not-allowed" : "pointer",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading) e.currentTarget.style.background = "#b8963a";
                  }}
                  onMouseLeave={(e) => {
                    if (!uploading) e.currentTarget.style.background = GOLD;
                  }}
                >
                  <PlusIcon />
                  {uploading ? "Uploading…" : "Add images"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddAlbumModalOpen(true)}
                  disabled={creating}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: creating ? "#d8d5d0" : GOLD,
                    color: "white",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: creating ? "not-allowed" : "pointer",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!creating) e.currentTarget.style.background = "#b8963a";
                  }}
                  onMouseLeave={(e) => {
                    if (!creating) e.currentTarget.style.background = GOLD;
                  }}
                >
                  <PlusIcon />
                  {creating ? "Creating…" : "Add Album"}
                </button>
              )}
            </>
          )}
          {isAdmin && venueOptions.length > 0 && !isAlbumView && (
            <select
              value={selectedVenueId ?? ""}
              onChange={(e) => setSelectedVenueId(e.target.value || null)}
              style={{
                marginLeft: "auto",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e8e6e2",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                minWidth: "180px",
              }}
            >
              <option value="">Select venue</option>
              {venueOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6966" }}>
            Loading albums…
          </div>
        ) : !effectiveVenueId ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6966" }}>
            {isAdmin ? "Select a venue to manage gallery." : "No venue assigned."}
          </div>
        ) : !isAlbumView ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => handleAlbumClick(album)}
                  onDelete={isAdmin ? () => handleDeleteAlbum(album.id) : undefined}
                />
              ))}
            </div>

            {albums.length === 0 && (
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
          </>
        ) : albumLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b6966" }}>
            Loading album…
          </div>
        ) : selectedAlbum ? (
          <>
            {selectedAlbum.description && (
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: "14px",
                  color: "#6b6966",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {selectedAlbum.description}
              </p>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
              }}
            >
              {(selectedAlbum.photos ?? []).map((photo) => (
                <GalleryImageCard
                  key={photo.id ?? photo._id}
                  imageUrl={photo.url}
                  photo={photo}
                  onDelete={handleDeleteImage}
                  deleting={deletingPhotoId === (photo.id ?? photo._id)}
                />
              ))}
            </div>

            {(!selectedAlbum.photos || selectedAlbum.photos.length === 0) && (
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
                  Tap Add images to upload multiple photos.
                </p>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  disabled={uploading}
                  style={{
                    marginTop: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: uploading ? "#d8d5d0" : GOLD,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: uploading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <PlusIcon />
                  {uploading ? "Uploading…" : "Add images"}
                </button>
              </div>
            )}
          </>
        ) : null}
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
