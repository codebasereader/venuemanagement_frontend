import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal, Select, Spin, message } from "antd";
import AddSpaceModal from "./AddSpaceModal";
import SpaceCard from "./SpaceCard";
import { listVenues } from "../../api/venue";
import {
  createSpace,
  deleteSpace,
  listSpaces,
  updateSpace,
} from "../../api/spaces";
import { uploadImageToS3 } from "../../api/images";
import { ROLES } from "../../../config";

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

function asSpacesArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.spaces)) return data.spaces;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function asVenuesArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.venues)) return data.venues;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function ViewSpaces() {
  const navigate = useNavigate();
  const { access_token: accessToken, role, venueId: myVenueId } = useSelector((s) => s.user.value);
  const [msgApi, contextHolder] = message.useMessage();

  const isAdmin = role === ROLES.ADMIN;
  const [venueOptions, setVenueOptions] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(myVenueId ?? null);

  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  const effectiveVenueId = isAdmin ? selectedVenueId : myVenueId;

  useEffect(() => {
    if (!accessToken || !isAdmin) return;
    setVenuesLoading(true);
    listVenues(accessToken)
      .then((data) => {
        const arr = asVenuesArray(data);
        const opts = arr
          .filter(Boolean)
          .map((v) => ({ value: v?._id ?? v?.id, label: v?.name ?? v?._id ?? "" }))
          .filter((o) => o.value);
        setVenueOptions(opts);
        if (!selectedVenueId && opts[0]?.value) setSelectedVenueId(opts[0].value);
      })
      .catch(() => {})
      .finally(() => setVenuesLoading(false));
  }, [accessToken, isAdmin, selectedVenueId]);

  const fetchSpaces = useCallback(async () => {
    if (!accessToken || !effectiveVenueId) return;
    setLoading(true);
    try {
      const data = await listSpaces(accessToken, effectiveVenueId);
      setSpaces(asSpacesArray(data));
    } catch (err) {
      msgApi.error(err?.response?.data?.message ?? "Failed to load spaces");
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, effectiveVenueId, msgApi]);

  useEffect(() => {
    if (!effectiveVenueId) return;
    fetchSpaces();
  }, [effectiveVenueId, fetchSpaces]);

  const handleSave = useCallback(
    async (payload) => {
      if (!effectiveVenueId) {
        msgApi.error("Select a venue first");
        return;
      }
      try {
        const entityId = payload._id || effectiveVenueId;
        const imageUrls = [];
        const rawImages = Array.isArray(payload.images) ? payload.images : [];
        for (const item of rawImages) {
          if (typeof item === "string") {
            imageUrls.push(item);
          } else if (item && typeof item === "object" && item instanceof File) {
            const publicUrl = await uploadImageToS3(accessToken, item, entityId);
            imageUrls.push(publicUrl);
          }
        }

        const body = {
          name: payload.name?.trim() ?? "",
          description: payload.description?.trim() ?? "",
          capacity: payload.capacity != null && payload.capacity !== "" ? Number(payload.capacity) : undefined,
          dimensions: payload.dimensions?.trim() || undefined,
          isActive: true,
          images: imageUrls,
        };
        if (payload._id) {
          await updateSpace(accessToken, effectiveVenueId, payload._id, body);
          msgApi.success("Space updated");
        } else {
          await createSpace(accessToken, effectiveVenueId, body);
          msgApi.success("Space added");
        }
        setModalOpen(false);
        setEditingSpace(null);
        await fetchSpaces();
      } catch (err) {
        msgApi.error(err?.response?.data?.message ?? err?.message ?? "Failed to save space");
        throw err;
      }
    },
    [accessToken, effectiveVenueId, fetchSpaces, msgApi],
  );

  const handleEdit = useCallback((space) => {
    setEditingSpace(space);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (space) => {
      if (!space?._id || !effectiveVenueId) return;
      Modal.confirm({
        centered: true,
        title: "Delete space?",
        content: `This will permanently delete "${space.name || space.spaceName || "this space"}".`,
        okText: "Delete",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteSpace(accessToken, effectiveVenueId, space._id);
            msgApi.success("Space deleted");
            await fetchSpaces();
          } catch (err) {
            msgApi.error(err?.response?.data?.message ?? "Failed to delete space");
          }
        },
      });
    },
    [accessToken, effectiveVenueId, fetchSpaces, msgApi],
  );

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
      {contextHolder}

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          fontFamily: "'DM Sans', sans-serif",
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

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {isAdmin && (
              <Select
                value={selectedVenueId}
                onChange={setSelectedVenueId}
                loading={venuesLoading}
                placeholder="Select venue"
                style={{ minWidth: 200 }}
                options={venueOptions}
                showSearch
                optionFilterProp="label"
              />
            )}
            <button
              type="button"
              onClick={openAddModal}
              disabled={!effectiveVenueId || loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: effectiveVenueId && !loading ? "#1a1917" : "#d8d5d0",
                color: "white",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: effectiveVenueId && !loading ? "pointer" : "not-allowed",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (effectiveVenueId && !loading) e.currentTarget.style.background = "#3d3b38";
              }}
              onMouseLeave={(e) => {
                if (effectiveVenueId && !loading) e.currentTarget.style.background = "#1a1917";
              }}
            >
              <PlusIcon />
              Add
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
            <Spin />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                gap: "20px",
              }}
            >
              {spaces.map((space) => (
                <SpaceCard
                  key={space._id ?? space.id}
                  space={space}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {spaces.length === 0 && !loading && (
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
                  disabled={!effectiveVenueId}
                  style={{
                    marginTop: "16px",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: effectiveVenueId ? "#1a1917" : "#d8d5d0",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: effectiveVenueId ? "pointer" : "not-allowed",
                  }}
                >
                  Add Space
                </button>
              </div>
            )}
          </>
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
