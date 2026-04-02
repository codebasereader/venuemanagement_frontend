import React, { useState } from "react";
import { formatINR } from "../quotes/quoteMath.js";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1100,
  padding: 16,
};

const modalStyle = {
  background: "white",
  borderRadius: 16,
  padding: 24,
  maxWidth: 420,
  width: "100%",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 800,
  color: "#1a1917",
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e8e6e2",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: "#1a1917",
  background: "white",
  boxSizing: "border-box",
};

const btnBase = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

export default function ConfirmPaymentNoteModal({
  isOpen,
  onClose,
  onConfirm,
  payment = null,
  submitting = false,
}) {
  const [confirmedNotes, setConfirmedNotes] = useState("");

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm({
      confirmedNotes: (confirmedNotes || "").trim(),
    });
    setConfirmedNotes("");
  };

  const handleClose = () => {
    if (!submitting) {
      setConfirmedNotes("");
      onClose?.();
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div
      style={overlayStyle}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 900,
            fontSize: 18,
            color: "#1a1917",
            marginBottom: 8,
          }}
        >
          Confirm payment received
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#6b6966",
            lineHeight: 1.5,
            margin: "0 0 16px 0",
          }}
        >
          Confirming {formatINR(payment.amount ?? 0)} received on{" "}
          {new Date(payment.receivedAt).toLocaleDateString("en-IN")}
        </p>
        <form onSubmit={handleConfirm}>
          <label style={labelStyle}>Confirmation notes (optional)</label>
          <textarea
            value={confirmedNotes}
            onChange={(e) => setConfirmedNotes(e.target.value)}
            placeholder="e.g. Payment confirmed by owner"
            style={{
              ...inputStyle,
              marginBottom: 20,
              minHeight: 80,
              resize: "vertical",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
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
              onClick={handleClose}
              disabled={submitting}
              style={{ ...btnBase, background: "#f0ede8", color: "#1a1917" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ ...btnBase, background: "#c9a84c", color: "#1a1917" }}
            >
              {submitting ? "Confirming…" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
