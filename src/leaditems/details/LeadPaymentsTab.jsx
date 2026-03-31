import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { listQuotesByLead } from "../../api/quote.js";
import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../../api/paymentReminders.js";
import {
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
  confirmAdvance,
} from "../../api/payments.js";
import ConfirmedQuoteCard from "../payments/ConfirmedQuoteCard.jsx";
import PaymentProgressCard from "../payments/PaymentProgressCard.jsx";
import PaymentHistoryCard from "../payments/PaymentHistoryCard.jsx";
import PaymentRemindersCard from "../payments/PaymentRemindersCard.jsx";
import AddReminderModal from "../payments/AddReminderModal.jsx";
import ReceivedPaymentModal from "../payments/ReceivedPaymentModal.jsx";
import AddPaymentModal from "../payments/AddPaymentModal.jsx";

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

export default function LeadPaymentsTab({ lead }) {
  const { access_token: token, venueId: reduxVenueId } = useSelector(
    (state) => state.user.value,
  );
  const userRole = useSelector((state) => state.user.value?.role);
  const venueId = reduxVenueId || lead?.venueId;
  const leadId = lead?._id;

  const [confirmedQuotes, setConfirmedQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [reminders, setReminders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [addReminderOpen, setAddReminderOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [receivedReminder, setReceivedReminder] = useState(null);
  const [receivedPayment, setReceivedPayment] = useState(null);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [reminderSubmitting, setReminderSubmitting] = useState(false);
  const [receivedSubmitting, setReceivedSubmitting] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [deleteReminder, setDeleteReminder] = useState(null);
  const [deletePayment, setDeletePayment] = useState(null);

  const fetchQuotes = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    try {
      const data = await listQuotesByLead(venueId, leadId, token, {
        confirmed: true,
      });
      const list = Array.isArray(data) ? data : [];
      setConfirmedQuotes(list);
      setSelectedQuoteId((prev) => {
        if (prev && list.some((q) => q?._id === prev)) return prev;
        return list[0]?._id || "";
      });
    } catch {
      setConfirmedQuotes([]);
      setSelectedQuoteId("");
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
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to load reminders.",
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

  const selectedQuote =
    confirmedQuotes.find((q) => q?._id === selectedQuoteId) || null;
  const totalAmount = selectedQuote?.pricing?.totals?.total ?? 0;

  const filteredReminders = selectedQuoteId
    ? reminders.filter((r) => !r?.quoteId || r?.quoteId === selectedQuoteId)
    : reminders;
  const filteredPayments = selectedQuoteId
    ? payments.filter((p) => !p?.quoteId || p?.quoteId === selectedQuoteId)
    : payments;
  const collectedAmount = filteredPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  );

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
          await updateReminder(
            venueId,
            leadId,
            editingReminder._id,
            payload,
            token,
          );
        } else {
          await createReminder(
            venueId,
            leadId,
            {
              ...payload,
              ...(selectedQuoteId ? { quoteId: selectedQuoteId } : {}),
            },
            token,
          );
        }
        setAddReminderOpen(false);
        setEditingReminder(null);
        await fetchReminders();
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to save reminder.",
        );
      } finally {
        setReminderSubmitting(false);
      }
    },
    [venueId, leadId, token, editingReminder, fetchReminders, selectedQuoteId],
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
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to delete reminder.",
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

  const handleReceivedPaymentClick = (payment) => {
    setReceivedPayment(payment);
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setAddPaymentOpen(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setAddPaymentOpen(true);
  };

  const handleReceivedConfirm = useCallback(
    async (payload) => {
      if (!venueId || !leadId || !token) return;
      setReceivedSubmitting(true);
      setError("");
      try {
        await createPayment(
          venueId,
          leadId,
          {
            ...payload,
            ...(selectedQuoteId ? { quoteId: selectedQuoteId } : {}),
          },
          token,
        );
        setReceivedReminder(null);
        await Promise.all([fetchPayments(), fetchReminders()]);
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to record payment.",
        );
      } finally {
        setReceivedSubmitting(false);
      }
    },
    [venueId, leadId, token, fetchPayments, fetchReminders, selectedQuoteId],
  );

  const handleReceivedPaymentConfirm = useCallback(async () => {
    if (!token || !receivedPayment?._id) return;
    setReceivedSubmitting(true);
    setError("");
    try {
      // Extract eventId from lead or payment object
      const eventId = receivedPayment?.eventId || lead?._id;
      const advanceNumber = receivedPayment?._id;

      if (!eventId) {
        throw new Error("Event ID not found");
      }

      await confirmAdvance(eventId, advanceNumber, token);
      setReceivedPayment(null);
      await fetchPayments();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to confirm advance payment.",
      );
    } finally {
      setReceivedSubmitting(false);
    }
  }, [token, receivedPayment, lead, fetchPayments]);

  const handlePaymentSubmit = useCallback(
    async (payload) => {
      if (!venueId || !leadId || !token) return;
      setPaymentSubmitting(true);
      setError("");
      try {
        if (editingPayment?._id) {
          await updatePayment(
            venueId,
            leadId,
            editingPayment._id,
            payload,
            token,
          );
        } else {
          await createPayment(
            venueId,
            leadId,
            {
              ...payload,
              ...(selectedQuoteId ? { quoteId: selectedQuoteId } : {}),
            },
            token,
          );
        }
        setAddPaymentOpen(false);
        setEditingPayment(null);
        await fetchPayments();
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to save payment.",
        );
      } finally {
        setPaymentSubmitting(false);
      }
    },
    [venueId, leadId, token, editingPayment, fetchPayments, selectedQuoteId],
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
          err.response?.data?.error?.message ||
            err.message ||
            "Failed to delete payment.",
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

      {loading &&
        confirmedQuotes.length === 0 &&
        reminders.length === 0 &&
        payments.length === 0 && (
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
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #ece9e4",
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: "#1a1917",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 10,
              }}
            >
              Confirmed quotes
            </div>
            <div style={{ borderTop: "1px solid #f1f0ee" }} />
            {confirmedQuotes.length === 0 ? (
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 13,
                  color: "#6b6966",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                No confirmed quote yet. Confirm a quote from the Quotes tab.
              </p>
            ) : (
              <div
                style={{
                  marginTop: 10,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
                  gap: 10,
                }}
              >
                {confirmedQuotes.map((q, idx) => {
                  const active = q?._id === selectedQuoteId;
                  return (
                    <button
                      key={q?._id || idx}
                      type="button"
                      onClick={() => setSelectedQuoteId(q?._id || "")}
                      style={{
                        textAlign: "left",
                        borderRadius: 12,
                        border: active
                          ? "2px solid #c9a84c"
                          : "1px solid #e8e6e2",
                        background: active ? "#fff8e7" : "#faf9f7",
                        padding: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: "#1a1917",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Quote {idx + 1}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: "#6b6966",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        Total: ₹
                        {Number(q?.pricing?.totals?.total || 0).toLocaleString(
                          "en-IN",
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <ConfirmedQuoteCard confirmedQuote={selectedQuote} />
          <PaymentProgressCard
            totalAmount={totalAmount}
            collectedAmount={collectedAmount}
          />
          <PaymentHistoryCard
            payments={filteredPayments}
            onDelete={(p) => setDeletePayment(p)}
            onEdit={handleEditPayment}
            onAdd={handleAddPayment}
            onReceived={handleReceivedPaymentClick}
            actionLoadingId={actionLoadingId}
            userRole={userRole}
          />
          <PaymentRemindersCard
            reminders={filteredReminders}
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

      {receivedPayment && (
        <ConfirmDeleteModal
          title="Confirm Payment Received"
          message={`Mark ₹${Number(receivedPayment.amount || 0).toLocaleString("en-IN")} as received?`}
          loading={receivedSubmitting}
          onCancel={() => setReceivedPayment(null)}
          onConfirm={handleReceivedPaymentConfirm}
        />
      )}

      <AddPaymentModal
        isOpen={addPaymentOpen}
        onClose={() => {
          setAddPaymentOpen(false);
          setEditingPayment(null);
        }}
        onSubmit={handlePaymentSubmit}
        initialPayment={editingPayment}
        submitting={paymentSubmitting}
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
