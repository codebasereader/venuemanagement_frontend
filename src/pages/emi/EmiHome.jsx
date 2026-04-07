import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { message } from "antd";
import {
  createBill,
  deleteBill,
  listBills,
  updateBill,
  upsertEmiStatus,
} from "../../api/emi";
import EmiListView from "./components/EmiListView";
import EmiCalendarView from "./components/EmiCalendarView";

// ── Tab icons ──────────────────────────────────────────────────────────────

function ListIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const TABS = [
  { key: "list", label: "List View", Icon: ListIcon },
  { key: "calendar", label: "Calendar", Icon: CalendarIcon },
];

export default function EmiHome() {
  const [activeTab, setActiveTab] = useState("list");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Per-operation loading flags
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [markPaidSubmitting, setMarkPaidSubmitting] = useState(false);

  // Form-level error (shown inside modals)
  const [formError, setFormError] = useState(null);

  const { venueId, access_token: accessToken } = useSelector(
    (state) => state.user.value,
  );

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchBills = useCallback(async () => {
    if (!venueId || !accessToken) return;
    try {
      setLoading(true);
      const data = await listBills(venueId, accessToken);
      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to load EMI bills");
    } finally {
      setLoading(false);
    }
  }, [venueId, accessToken]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // ── CRUD helpers ─────────────────────────────────────────────────────────

  const handleAddBill = async (payload) => {
    setFormError(null);
    setAddSubmitting(true);
    try {
      const created = await createBill(venueId, payload, accessToken);
      setBills((prev) => [...prev, created]);
      message.success("EMI bill added");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add bill";
      setFormError(msg);
      throw err; // keeps modal open
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEditBill = async (billId, payload) => {
    setFormError(null);
    setEditSubmitting(true);
    try {
      const updated = await updateBill(venueId, billId, payload, accessToken);
      setBills((prev) => prev.map((b) => (b._id === billId ? updated : b)));
      message.success("Bill updated");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update bill";
      setFormError(msg);
      throw err;
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    setDeleteSubmitting(true);
    try {
      await deleteBill(venueId, billId, accessToken);
      setBills((prev) => prev.filter((b) => b._id !== billId));
      message.success("Bill deleted");
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to delete bill");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleUpsertStatus = async (billId, payload) => {
    setMarkPaidSubmitting(true);
    try {
      const updated = await upsertEmiStatus(
        venueId,
        billId,
        payload,
        accessToken,
      );
      setBills((prev) => prev.map((b) => (b._id === billId ? updated : b)));
      message.success("Payment recorded ✓");
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to record payment");
      throw err; // keeps MarkPaidModal open
    } finally {
      setMarkPaidSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        padding: "clamp(16px,3vw,28px)",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(22px,5vw,30px)",
            color: "#1a1917",
            lineHeight: 1.2,
          }}
        >
          EMI/Bills Tracker
        </h1>
        <p
          style={{
            margin: "5px 0 0",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#9a9896",
          }}
        >
          Track recurring bills and monthly EMI payments for your venue
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 18px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              background: activeTab === key ? "#1a1917" : "#f0ede8",
              color: activeTab === key ? "#fff" : "#1a1917",
              transition: "background 0.15s, color 0.15s",
              boxShadow:
                activeTab === key ? "0 2px 8px rgba(26,25,23,0.15)" : "none",
            }}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {/* Content card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #ece9e4",
          borderRadius: 14,
          padding: "clamp(14px,2.5vw,24px)",
          minHeight: 300,
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 20px",
              gap: 12,
              color: "#9a9896",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
            }}
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c5c2be"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading bills…
          </div>
        ) : activeTab === "list" ? (
          <EmiListView
            bills={bills}
            onAddBill={handleAddBill}
            onEditBill={handleEditBill}
            onDeleteBill={handleDeleteBill}
            onUpsertStatus={handleUpsertStatus}
            addSubmitting={addSubmitting}
            editSubmitting={editSubmitting}
            deleteSubmitting={deleteSubmitting}
            markPaidSubmitting={markPaidSubmitting}
            formError={formError}
          />
        ) : (
          <EmiCalendarView
            bills={bills}
            onUpsertStatus={handleUpsertStatus}
            markPaidSubmitting={markPaidSubmitting}
          />
        )}
      </div>
    </div>
  );
}
