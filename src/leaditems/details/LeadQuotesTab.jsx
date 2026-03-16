import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CreateQuoteModal from "../quotes/CreateQuoteModal.jsx";
import { formatINR } from "../quotes/quoteMath.js";
import {
  createQuote,
  listQuotesByLead,
  updateQuote,
  deleteQuote,
} from "../../api/quote.js";

function EmptyCard({ title, description }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px dashed #e8e6e2",
        padding: 18,
      }}
    >
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, color: "#1a1917", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6b6966" }}>{description}</div>
    </div>
  );
}

function getBookingLabelWithSpace(quote, baseLabelForSpace, baseLabelForVenue) {
  if (quote?.bookingType === "space_buyout") {
    const spaceName = quote?.space?.name;
    return spaceName ? `${baseLabelForSpace} • ${spaceName}` : baseLabelForSpace;
  }
  return baseLabelForVenue;
}

function shareQuoteWhatsApp(lead, quote) {
  const name = lead?.contact?.name || "Customer";
  const ew = quote?.eventWindow || {};
  const start = ew.startAt ? new Date(ew.startAt).toISOString().replace("T", " ").slice(0, 16) : "—";
  const end = ew.endAt ? new Date(ew.endAt).toISOString().replace("T", " ").slice(0, 16) : "—";
  const duration = ew.durationHours || "";
  const pricing = quote?.pricing || {};
  const totals = pricing.totals || {};
  const bookingType = getBookingLabelWithSpace(
    quote,
    "Space buyout",
    "Full venue buyout",
  );
  const addonsArr = Array.isArray(pricing.addons) ? pricing.addons : [];
  const addonsStr =
    addonsArr.length > 0
      ? addonsArr.map((a) => `${a.name} ×${a.quantity || 0}`).join(", ")
      : "None";
  const text = [
    `Quote for ${name}`,
    `Event: ${start} – ${end} (${duration}h)`,
    `Booking: ${bookingType}`,
    `Add-ons: ${addonsStr}`,
    `Venue + GST: ${formatINR((totals.venueBase || 0) + (totals.venueGst || 0))}`,
    `Add-ons + GST: ${formatINR((totals.addonTotal || 0) + (totals.addonGst || 0))}`,
    totals.discount > 0 ? `Discount: −${formatINR(totals.discount)}` : null,
    `TOTAL: ${formatINR(totals.total || 0)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const phone = (lead?.contact?.phone || "").replace(/\D/g, "");
  const num = phone.startsWith("91") ? phone : `91${phone}`;
  const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

const btnPrimary = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "#c9a84c",
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const btnDanger = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #f6c8c2",
  background: "#fde8e6",
  color: "#a33b2d",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #d4cfc4",
  background: "#f5f3ef",
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const btnWhatsApp = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "#25D366",
  color: "#ffffff",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

function EyeIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ConfirmBookingModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;
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
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          maxWidth: 400,
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
          Confirm booking
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
          This quote will be converted to a confirmed booking and will no longer be editable.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              ...btnSecondary,
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
              ...btnPrimary,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Confirming…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteQuoteModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;
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
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          maxWidth: 400,
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
          Delete quote
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
          Are you sure you want to permanently delete this quote? This action cannot be
          undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              ...btnSecondary,
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
              ...btnDanger,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewQuoteModal({ isOpen, onClose, quote, lead }) {
  if (!isOpen || !quote) return null;
  const ew = quote.eventWindow || {};
  const pricing = quote.pricing || {};
  const totals = pricing.totals || {};
  const inclusions = Array.isArray(pricing.inclusions) ? pricing.inclusions : [];
  const addons = Array.isArray(pricing.addons) ? pricing.addons : [];
  const bookingLabel = getBookingLabelWithSpace(
    quote,
    "Space buyout",
    "Full venue buyout",
  );

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          maxWidth: 420,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 900,
              fontSize: 16,
              color: "#1a1917",
            }}
          >
            Quote details
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid #e8e6e2",
              background: "#faf9f7",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#6b6966",
            marginBottom: 12,
          }}
        >
          For: {lead?.contact?.name || "—"}
        </div>

        <div style={{ borderTop: "1px solid #f1f0ee", paddingTop: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 6,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          >
            <span style={{ color: "#6b6966", fontWeight: 700 }}>Booking</span>
            <span style={{ color: "#1a1917", fontWeight: 800 }}>{bookingLabel}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 6,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          >
            <span style={{ color: "#6b6966", fontWeight: 700 }}>Event window</span>
            <span style={{ color: "#1a1917", fontWeight: 800, textAlign: "right" }}>
              {formatDateTime(ew.startAt)} → {formatDateTime(ew.endAt)} (
              {ew.durationHours || 0}h)
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 6,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          >
            <span style={{ color: "#6b6966", fontWeight: 700 }}>Base rental</span>
            <span style={{ color: "#1a1917", fontWeight: 800 }}>
              {formatINR(pricing.basePrice || 0)}
            </span>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 10, paddingTop: 10 }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              color: "#6b6966",
              marginBottom: 4,
            }}
          >
            Inclusions
          </div>
          {inclusions.length === 0 && (
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#6b6966",
              }}
            >
              None
            </div>
          )}
          {inclusions.map((i) => (
            <div
              key={i.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              <span style={{ color: "#1a1917" }}>{i.name}</span>
              <span style={{ color: "#6b6966", fontWeight: 700 }}>
                ×{i.quantity || 0}
              </span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 10, paddingTop: 10 }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              color: "#6b6966",
              marginBottom: 4,
            }}
          >
            Add-ons
          </div>
          {addons.length === 0 && (
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#6b6966",
              }}
            >
              None
            </div>
          )}
          {addons.map((a) => (
            <div
              key={a.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                marginTop: 2,
              }}
            >
              <span style={{ color: "#1a1917" }}>{a.name}</span>
              <span style={{ color: "#6b6966", fontWeight: 700 }}>
                ×{a.quantity || 0}
              </span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #f1f0ee", marginTop: 10, paddingTop: 10 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            <span style={{ color: "#6b6966", fontWeight: 700 }}>Venue + GST</span>
            <span style={{ color: "#1a1917", fontWeight: 800 }}>
              {formatINR((totals.venueBase || 0) + (totals.venueGst || 0))}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            <span style={{ color: "#6b6966", fontWeight: 700 }}>Add-ons + GST</span>
            <span style={{ color: "#1a1917", fontWeight: 800 }}>
              {formatINR((totals.addonTotal || 0) + (totals.addonGst || 0))}
            </span>
          </div>
          {totals.discount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <span style={{ color: "#6b6966", fontWeight: 700 }}>Discount</span>
              <span style={{ color: "#1a1917", fontWeight: 800 }}>
                −{formatINR(totals.discount)}
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            <span style={{ color: "#1a1917", fontWeight: 900 }}>TOTAL</span>
            <span style={{ color: "#1a1917", fontWeight: 900 }}>
              {formatINR(totals.total || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadQuotesTab({ lead }) {
  const { access_token: token, venueId: reduxVenueId } = useSelector((state) => state.user.value);
  const venueId = reduxVenueId || lead?.venueId;

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [confirmQuoteId, setConfirmQuoteId] = useState(null); // quoteId when confirm-booking modal is open
  const [viewQuote, setViewQuote] = useState(null);
  const [deleteQuoteId, setDeleteQuoteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const leadId = lead?._id;

  const fetchQuotes = useCallback(async () => {
    if (!venueId || !leadId || !token) return;
    setError("");
    setLoading(true);
    try {
      const data = await listQuotesByLead(venueId, leadId, token);
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || err.message || "Failed to load quotes.",
      );
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [venueId, leadId, token]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleCreate = useCallback(
    async (payload) => {
      if (!venueId || !leadId || !token) {
        setError("Missing venue or auth.");
        return;
      }
      setError("");
      setActionLoading("create");
      try {
        await createQuote(venueId, leadId, payload, token);
        setIsCreateOpen(false);
        await fetchQuotes();
      } catch (err) {
        setError(
          err.response?.data?.error?.message || err.message || "Failed to create quote.",
        );
      } finally {
        setActionLoading(null);
      }
    },
    [venueId, leadId, token, fetchQuotes],
  );

  const handleConfirm = useCallback(
    async (quoteId) => {
      if (!venueId || !leadId || !token) return;
      setError("");
      setActionLoading(quoteId);
      try {
        await updateQuote(venueId, leadId, quoteId, { confirmed: true, draft: false }, token);
        await fetchQuotes();
      } catch (err) {
        setError(
          err.response?.data?.error?.message || err.message || "Failed to confirm quote.",
        );
      } finally {
        setActionLoading(null);
      }
    },
    [venueId, leadId, token, fetchQuotes],
  );

  const handleDelete = useCallback(
    async (quoteId) => {
      if (!venueId || !leadId || !token) return;
      setError("");
      setActionLoading(quoteId);
      try {
        await deleteQuote(venueId, leadId, quoteId, token);
        await fetchQuotes();
      } catch (err) {
        setError(
          err.response?.data?.error?.message || err.message || "Failed to delete quote.",
        );
      } finally {
        setActionLoading(null);
      }
    },
    [venueId, leadId, token, fetchQuotes],
  );

  const handleUpdate = useCallback(
    async (quoteId, payload) => {
      if (!venueId || !leadId || !token) return;
      setError("");
      setActionLoading(quoteId);
      try {
        await updateQuote(venueId, leadId, quoteId, payload, token);
        setEditingQuote(null);
        setIsCreateOpen(false);
        await fetchQuotes();
      } catch (err) {
        setError(
          err.response?.data?.error?.message || err.message || "Failed to update quote.",
        );
      } finally {
        setActionLoading(null);
      }
    },
    [venueId, leadId, token, fetchQuotes],
  );

  const openCreate = () => {
    setEditingQuote(null);
    setIsCreateOpen(true);
  };

  const openEdit = (quote) => {
    setEditingQuote(quote);
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingQuote(null);
  };

  const handleConfirmBookingFromModal = useCallback(async () => {
    if (!confirmQuoteId) return;
    try {
      await handleConfirm(confirmQuoteId);
      setConfirmQuoteId(null);
    } catch {
      // Error shown in list; modal stays open so user can retry or cancel
    }
  }, [confirmQuoteId, handleConfirm]);

  const hasQuotes = quotes.length > 0;
  const canCreate = Boolean(venueId && leadId && token);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={openCreate}
          disabled={!canCreate || actionLoading != null}
          style={{
            ...btnPrimary,
            opacity: canCreate && !actionLoading ? 1 : 0.7,
            cursor: canCreate && !actionLoading ? "pointer" : "not-allowed",
          }}
        >
          + Create
        </button>
      </div>

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

      {loading && (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            color: "#6b6966",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
          }}
        >
          Loading quotes…
        </div>
      )}

      {!loading && !hasQuotes && (
        <EmptyCard
          title="No quotes yet"
          description="Create a quote for this event. Use the Create button above."
        />
      )}

      {!loading &&
        quotes.map((q, idx) => {
          const totals = q?.pricing?.totals || {};
          const totalAmount = totals.total != null ? totals.total : null;
          const isDraft = q?.draft ?? !q?.confirmed;
          const isConfirmed = q?.confirmed === true;
          const bookingLabel = getBookingLabelWithSpace(
            q,
            "Space buyout",
            "Venue buyout",
          );
          const busy = actionLoading === q._id;

          return (
            <div
              key={q._id}
              style={{
                background: "white",
                borderRadius: 16,
                border: "1px solid #ece9e4",
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 900,
                      color: "#1a1917",
                    }}
                  >
                    Quote {idx + 1}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: "#6b6966",
                    }}
                  >
                    {bookingLabel}
                    {totalAmount != null && ` • ${formatINR(totalAmount)}`}
                    {isDraft && " • Draft"}
                    {isConfirmed && " • Confirmed"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                {isDraft && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(q)}
                      disabled={busy}
                      style={{
                        ...btnSecondary,
                        opacity: busy ? 0.7 : 1,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmQuoteId(q._id)}
                      disabled={busy}
                      style={{
                        ...btnPrimary,
                        opacity: busy ? 0.7 : 1,
                      }}
                    >
                      {busy ? "…" : "Confirm book"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewQuote(q)}
                      disabled={busy}
                      style={{
                        ...btnSecondary,
                        padding: 0,
                        width: 34,
                        height: 34,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="View quote details"
                      title="View details"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteQuoteId(q._id)}
                      disabled={busy}
                      style={{
                        ...btnDanger,
                        opacity: busy ? 0.7 : 1,
                      }}
                    >
                      {busy ? "…" : "Delete"}
                    </button>
                  </>
                )}
                {isConfirmed && (
                  <>
                    <button
                      type="button"
                      onClick={() => setViewQuote(q)}
                      disabled={busy}
                      style={{
                        ...btnSecondary,
                        padding: 0,
                        width: 34,
                        height: 34,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="View quote details"
                      title="View details"
                    >
                      <EyeIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteQuoteId(q._id)}
                      disabled={busy}
                      style={{
                        ...btnDanger,
                        opacity: busy ? 0.7 : 1,
                      }}
                    >
                      {busy ? "…" : "Delete"}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => shareQuoteWhatsApp(lead, q)}
                  style={btnWhatsApp}
                >
                  WhatsApp
                </button>
              </div>
            </div>
          );
        })}

      <ConfirmBookingModal
        isOpen={Boolean(confirmQuoteId)}
        onClose={() => setConfirmQuoteId(null)}
        onConfirm={handleConfirmBookingFromModal}
        loading={confirmQuoteId != null && actionLoading === confirmQuoteId}
      />

      <DeleteQuoteModal
        isOpen={Boolean(deleteQuoteId)}
        onClose={() => setDeleteQuoteId(null)}
        onConfirm={async () => {
          if (!deleteQuoteId) return;
          await handleDelete(deleteQuoteId);
          setDeleteQuoteId(null);
        }}
        loading={deleteQuoteId != null && actionLoading === deleteQuoteId}
      />

      <ViewQuoteModal
        isOpen={Boolean(viewQuote)}
        onClose={() => setViewQuote(null)}
        quote={viewQuote}
        lead={lead}
      />

      <CreateQuoteModal
        isOpen={isCreateOpen}
        onClose={closeModal}
        lead={lead}
        editQuote={editingQuote}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        submitting={actionLoading === "create" || (editingQuote && actionLoading === editingQuote._id)}
      />
    </div>
  );
}
