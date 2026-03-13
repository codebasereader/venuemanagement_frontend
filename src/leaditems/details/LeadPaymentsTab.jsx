import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { listQuotesByLead } from "../../api/quote.js";
import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../../api/paymentReminders.js";
import { listPayments, createPayment, deletePayment } from "../../api/payments.js";
import ConfirmedQuoteCard from "../payments/ConfirmedQuoteCard.jsx";
import PaymentProgressCard from "../payments/PaymentProgressCard.jsx";
import PaymentHistoryCard from "../payments/PaymentHistoryCard.jsx";
import PaymentRemindersCard from "../payments/PaymentRemindersCard.jsx";
import AddReminderModal from "../payments/AddReminderModal.jsx";
import ReceivedPaymentModal from "../payments/ReceivedPaymentModal.jsx";

function ConfirmDeleteModal({ title, message, loading, onCancel, onConfirm }) {
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
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
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

export default function LeadPaymentsTab({ lead }) {
  const { access_token: token, venueId: reduxVenueId } = useSelector((state) => state.user.value);
  const venueId = reduxVenueId || lead?.venueId;
  const leadId = lead?._id;

  const [confirmedQuote, setConfirmedQuote] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [addReminderOpen, setAddReminderOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [receivedReminder, setReceivedReminder] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [reminderSubmitting, setReminderSubmitting] = useState(false);
  const [receivedSubmitting, setReceivedSubmitting] = useState(false);
  const [deleteReminder, setDeleteReminder] = useState(null);
  const [deletePayment, setDeletePayment] = useState(null);

  const fetchQuotes = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    try {
      const data = await listQuotesByLead(venueId, leadId, token, { confirmed: true });
      const list = Array.isArray(data) ? data : [];
      setConfirmedQuote(list.length > 0 ? list[0] : null);
    } catch {
      setConfirmedQuote(null);
    }
  }, [venueId, leadId, token]);

  const fetchReminders = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    setError("");
    try {
      const data = await listReminders(venueId, leadId, token);
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || err.message || "Failed to load reminders.",
      );
      setReminders([]);
    }
  }, [venueId, leadId, token]);

  const fetchPayments = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    try {
      const data = await listPayments(venueId, leadId, token);
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    }
  }, [venueId, leadId, token]);

  const loadAll = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    setLoading(true);
    setError("");
    try {
      await Promise.all([fetchQuotes(), fetchReminders(), fetchPayments()]);
    } finally {
      setLoading(false);
    }
  }, [venueId, leadId, token, fetchQuotes, fetchReminders, fetchPayments]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const totalAmount = confirmedQuote?.pricing?.totals?.total ?? 0;
  const collectedAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleAddReminder = () => {
    setEditingReminder(null);
    setAddReminderOpen(true);
  };

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setAddReminderOpen(true);
  };

  const handleReminderSubmit = useCallback(
    async (payload) => {
      if (!venueId || !leadId || !token) return;
      setReminderSubmitting(true);
      setError("");
      try {
        if (editingReminder?._id) {
          await updateReminder(venueId, leadId, editingReminder._id, payload, token);
        } else {
          await createReminder(venueId, leadId, payload, token);
        }
        setAddReminderOpen(false);
        setEditingReminder(null);
        await fetchReminders();
      } catch (err) {
        setError(
          err.response?.data?.error?.message || err.message || "Failed to save reminder.",
        );
      } finally {
        setReminderSubmitting(false);
      }
    },
    [venueId, leadId, token, editingReminder, fetchReminders],
  );

  const handleDeleteReminder = useCallback(
    async (reminder) => {
      if (!venueId || !leadId || !token) return;
      setActionLoadingId(reminder._id);
      setError("");
      try {
        await deleteReminder(venueId, leadId, reminder._id, token);
        await fetchReminders();
      } catch (err) {
        setError(
          err.response?.data?.error?.message || err.message || "Failed to delete reminder.",
        );
      } finally {
        setActionLoadingId(null);
      }
    },
    [venueId, leadId, token, fetchReminders],
  );

  const handleReceivedClick = (reminder) => {
    setReceivedReminder(reminder);
  };

  const handleReceivedConfirm = useCallback(
    async (payload) => {
      if (!venueId || !leadId || !token) return;
      setReceivedSubmitting(true);
      setError("");
      try {
        await createPayment(venueId, leadId, payload, token);
        setReceivedReminder(null);
        await Promise.all([fetchPayments(), fetchReminders()]);
      } catch (err) {
        setError(
          err.response?.data?.error?.message || err.message || "Failed to record payment.",
        );
      } finally {
        setReceivedSubmitting(false);
      }
    },
    [venueId, leadId, token, fetchPayments, fetchReminders],
  );

  const handleDeletePayment = useCallback(
    async (payment) => {
      if (!venueId || !leadId || !token) return;
      setActionLoadingId(payment._id);
      setError("");
      try {
        await deletePayment(venueId, leadId, payment._id, token);
        await fetchPayments();
      } catch (err) {
        setError(
          err.response?.data?.error?.message || err.message || "Failed to delete payment.",
        );
      } finally {
        setActionLoadingId(null);
      }
    },
    [venueId, leadId, token, fetchPayments],
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

      {loading && !confirmedQuote && reminders.length === 0 && payments.length === 0 && (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            color: "#6b6966",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
          }}
        >
          Loading…
        </div>
      )}

      {!loading && (
        <>
          <ConfirmedQuoteCard confirmedQuote={confirmedQuote} />
          <PaymentProgressCard totalAmount={totalAmount} collectedAmount={collectedAmount} />
          <PaymentHistoryCard
            payments={payments}
        onDelete={(p) => setDeletePayment(p)}
            actionLoadingId={actionLoadingId}
          />
          <PaymentRemindersCard
            reminders={reminders}
            onAdd={handleAddReminder}
            onEdit={handleEditReminder}
        onDelete={(r) => setDeleteReminder(r)}
            onReceived={handleReceivedClick}
            loading={loading}
            actionLoadingId={actionLoadingId}
          />
        </>
      )}

      <AddReminderModal
        isOpen={addReminderOpen}
        onClose={() => {
          setAddReminderOpen(false);
          setEditingReminder(null);
        }}
        onSubmit={handleReminderSubmit}
        editReminder={editingReminder}
        submitting={reminderSubmitting}
      />

      <ReceivedPaymentModal
        isOpen={Boolean(receivedReminder)}
        onClose={() => setReceivedReminder(null)}
        onConfirm={handleReceivedConfirm}
        reminder={receivedReminder}
        submitting={receivedSubmitting}
      />

      {/* Delete reminder modal */}
      {deleteReminder && (
        <ConfirmDeleteModal
          title="Delete reminder"
          message="Are you sure you want to delete this payment reminder?"
          loading={actionLoadingId === deleteReminder._id}
          onCancel={() => setDeleteReminder(null)}
          onConfirm={async () => {
            await handleDeleteReminder(deleteReminder);
            setDeleteReminder(null);
          }}
        />
      )}

      {/* Delete payment modal */}
      {deletePayment && (
        <ConfirmDeleteModal
          title="Delete payment"
          message="Are you sure you want to remove this payment from history?"
          loading={actionLoadingId === deletePayment._id}
          onCancel={() => setDeletePayment(null)}
          onConfirm={async () => {
            await handleDeletePayment(deletePayment);
            setDeletePayment(null);
          }}
        />
      )}
    </div>
  );
}
