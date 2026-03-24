import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  listCommissions,
  createCommission,
  updateCommission,
  deleteCommission,
} from "../../api/commissions.js";
import {
  listLabours,
  createLabour,
  updateLabour,
  deleteLabour,
} from "../../api/labours.js";
import { listVendors, createVendor } from "../../api/vendors.js";
import CommissionListCard from "../commissions/CommissionListCard.jsx";
import CommissionPieCard from "../commissions/CommissionPieCard.jsx";
import CommissionModal from "../commissions/CommissionModal.jsx";
import LabourListCard from "../commissions/LabourListCard.jsx";
import LabourModal from "../commissions/LabourModal.jsx";
import LabourTabs from "../commissions/LabourTabs.jsx";
import VendorModal from "../vendors/VendorModal.jsx";

function ConfirmDeleteModal({ title, message, loading, onCancel, onConfirm }) {
  if (!title) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel?.()}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 900,
            fontSize: 16,
            color: "#1a1917",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#6b6966",
            lineHeight: 1.5,
            margin: "0 0 20px 0",
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #d4cfc4",
              background: "#f5f3ef",
              color: "#1a1917",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "none",
              background: "#c9a84c",
              color: "#1a1917",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Deleting…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadCommissionsTab({ lead }) {
  const { access_token: token, venueId: reduxVenueId } = useSelector(
    (state) => state.user.value,
  );
  const venueId = reduxVenueId || lead?.venueId;
  const leadId = lead?._id;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [vendorSubmitting, setVendorSubmitting] = useState(false);

  const [editDirection, setEditDirection] = useState(null);
  const [editingCommission, setEditingCommission] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeInnerTab, setActiveInnerTab] = useState("commissions");
  const [labourItems, setLabourItems] = useState([]);
  const [editingLabour, setEditingLabour] = useState(null);
  const [labourModalOpen, setLabourModalOpen] = useState(false);
  const [labourSubmitting, setLabourSubmitting] = useState(false);
  const [deleteLabourTarget, setDeleteLabourTarget] = useState(null);

  const fetchCommissions = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    setError("");
    setLoading(true);
    try {
      const data = await listCommissions(venueId, leadId, token);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to load commissions.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [venueId, leadId, token]);

  const fetchVendors = useCallback(async () => {
    if (!venueId || !token) return;
    setVendorsLoading(true);
    try {
      const data = await listVendors(venueId, token);
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      setVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  }, [venueId, token]);

  const fetchLabours = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    try {
      const data = await listLabours(venueId, leadId, token);
      setLabourItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to load labour entries.",
      );
      setLabourItems([]);
    }
  }, [venueId, leadId, token]);

  useEffect(() => {
    fetchCommissions();
    fetchVendors();
    fetchLabours();
  }, [fetchCommissions, fetchVendors, fetchLabours]);

  const outflowItems = useMemo(
    () => items.filter((c) => c.direction === "outflow"),
    [items],
  );
  const inflowItems = useMemo(
    () => items.filter((c) => c.direction === "inflow"),
    [items],
  );

  const outflowTotal = useMemo(
    () => outflowItems.reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
    [outflowItems],
  );
  const inflowTotal = useMemo(
    () => inflowItems.reduce((sum, c) => sum + (Number(c.amount) || 0), 0),
    [inflowItems],
  );
  const labourTotal = useMemo(
    () => labourItems.reduce((sum, l) => sum + (Number(l.amount) || 0), 0),
    [labourItems],
  );

  const openAdd = (direction) => {
    setEditDirection(direction);
    setEditingCommission(null);
  };

  const openEdit = (commission) => {
    setEditDirection(commission.direction);
    setEditingCommission(commission);
  };

  const closeModal = () => {
    if (modalSubmitting) return;
    setEditDirection(null);
    setEditingCommission(null);
  };

  const handleSubmit = useCallback(
    async (payload) => {
      if (!venueId || !leadId || !token) return;
      setModalSubmitting(true);
      setError("");
      try {
        if (editingCommission?._id) {
          await updateCommission(
            venueId,
            leadId,
            editingCommission._id,
            payload,
            token,
          );
        } else {
          await createCommission(venueId, leadId, payload, token);
        }
        setEditDirection(null);
        setEditingCommission(null);
        await fetchCommissions();
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to save commission.",
        );
      } finally {
        setModalSubmitting(false);
      }
    },
    [venueId, leadId, token, editingCommission, fetchCommissions],
  );

  const handleDelete = useCallback(
    async (commission) => {
      if (!venueId || !leadId || !token) return;
      setActionLoadingId(commission._id);
      setError("");
      try {
        await deleteCommission(venueId, leadId, commission._id, token);
        await fetchCommissions();
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to delete commission.",
        );
      } finally {
        setActionLoadingId(null);
      }
    },
    [venueId, leadId, token, fetchCommissions],
  );

  const handleVendorSubmit = useCallback(
    async (payload) => {
      if (!venueId || !token) return;
      setVendorSubmitting(true);
      try {
        const created = await createVendor(venueId, payload, token);
        setVendorModalOpen(false);
        // Optimistically add to list
        setVendors((prev) =>
          created && created._id ? [...prev, created] : prev,
        );
      } finally {
        setVendorSubmitting(false);
      }
    },
    [venueId, token],
  );

  const handleLabourSubmit = useCallback(
    async (payload) => {
      if (!venueId || !leadId || !token) return;
      setLabourSubmitting(true);
      setError("");
      try {
        const body = {
          date: payload.date,
          shiftType: payload.shiftType,
          labourCount: Number(payload.labourCount) || 0,
          dayRate: Number(payload.dayRate) || 0,
          nightRate: Number(payload.nightRate) || 0,
          amount: Number(payload.amount) || 0,
          taxableAmount: Number(payload.taxableAmount) || 0,
          gstIncluded: Boolean(payload.gstIncluded),
          gstRate: Number(payload.gstRate) || 0,
          gstAmount: Number(payload.gstAmount) || 0,
          notes: payload.notes || "",
        };
        if (editingLabour?._id) {
          await updateLabour(venueId, leadId, editingLabour._id, body, token);
        } else {
          await createLabour(venueId, leadId, body, token);
        }
        await fetchLabours();
        setEditingLabour(null);
        setLabourModalOpen(false);
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to save labour entry.",
        );
      } finally {
        setLabourSubmitting(false);
      }
    },
    [venueId, leadId, token, editingLabour, fetchLabours],
  );

  const handleDeleteLabour = useCallback(
    async (target) => {
      if (!venueId || !leadId || !token) return;
      setActionLoadingId(target._id);
      setError("");
      try {
        await deleteLabour(venueId, leadId, target._id, token);
        await fetchLabours();
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to delete labour entry.",
        );
      } finally {
        setActionLoadingId(null);
      }
    },
    [venueId, leadId, token, fetchLabours],
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!!error && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "#fde8e6",
            border: "1px solid #f6c8c2",
            color: "#a33b2d",
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {error}
        </div>
      )}

      {loading && items.length === 0 && (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            color: "#6b6966",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
          }}
        >
          Loading commissions…
        </div>
      )}

      {!loading && (
        <>
          <LabourTabs activeKey={activeInnerTab} onChange={setActiveInnerTab} />
          <CommissionPieCard
            outflowTotal={outflowTotal}
            inflowTotal={inflowTotal}
            labourTotal={labourTotal}
          />
          {activeInnerTab === "commissions" ? (
            <>
              <CommissionListCard
                title="Outflow cash (you pay)"
                commissions={outflowItems}
                onAdd={() => openAdd("outflow")}
                onEdit={openEdit}
                onDelete={(c) => setDeleteTarget(c)}
                actionLoadingId={actionLoadingId}
                emptyMessage="No outflow commissions yet. Use Add to record what you pay to others."
              />
              <CommissionListCard
                title="Inflow cash (you receive)"
                commissions={inflowItems}
                onAdd={() => openAdd("inflow")}
                onEdit={openEdit}
                onDelete={(c) => setDeleteTarget(c)}
                actionLoadingId={actionLoadingId}
                emptyMessage="No inflow commissions yet. Use Add to record commissions you get from others."
              />
            </>
          ) : (
            <LabourListCard
              entries={labourItems}
              onAdd={() => {
                setEditingLabour(null);
                setLabourModalOpen(true);
              }}
              onEdit={(entry) => {
                setEditingLabour(entry);
                setLabourModalOpen(true);
              }}
              onDelete={(entry) => setDeleteLabourTarget(entry)}
              actionLoadingId={actionLoadingId}
            />
          )}
        </>
      )}

      <CommissionModal
        isOpen={Boolean(editDirection)}
        direction={editDirection || "outflow"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialCommission={editingCommission}
        submitting={modalSubmitting}
        vendors={vendors}
        onAddVendor={() => setVendorModalOpen(true)}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete commission"
          message="Are you sure you want to delete this commission entry?"
          loading={actionLoadingId === deleteTarget._id}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await handleDelete(deleteTarget);
            setDeleteTarget(null);
          }}
        />
      )}

      {deleteLabourTarget && (
        <ConfirmDeleteModal
          title="Delete labour entry"
          message="Are you sure you want to delete this labour row?"
          loading={actionLoadingId === deleteLabourTarget._id}
          onCancel={() => setDeleteLabourTarget(null)}
          onConfirm={async () => {
            await handleDeleteLabour(deleteLabourTarget);
            setDeleteLabourTarget(null);
          }}
        />
      )}

      <LabourModal
        isOpen={labourModalOpen}
        onClose={() => {
          if (!labourSubmitting) {
            setLabourModalOpen(false);
            setEditingLabour(null);
          }
        }}
        onSubmit={handleLabourSubmit}
        submitting={labourSubmitting}
        initialLabour={editingLabour}
      />

      <VendorModal
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        onSubmit={handleVendorSubmit}
        submitting={vendorSubmitting}
      />
    </div>
  );
}

