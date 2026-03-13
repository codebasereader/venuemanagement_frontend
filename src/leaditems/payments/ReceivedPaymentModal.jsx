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
  maxWidth: 400,
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

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
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

export default function ReceivedPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  reminder = null,
  submitting = false,
}) {
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState("account");

  const amount = reminder?.expectedAmount ?? 0;

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm({
      amount: Number(amount) || 0,
      method,
      notes: (notes || "").trim(),
      reminderId: reminder?._id,
    });
    setNotes("");
    setMethod("account");
  };

  const handleClose = () => {
    if (!submitting) {
      setNotes("");
      setMethod("account");
      onClose?.();
    }
  };

  if (!isOpen) return null;

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
          Are you sure you received {formatINR(amount)}? This will update the progress and mark the reminder as received.
        </p>
        <form onSubmit={handleConfirm}>
          <label style={labelStyle}>Received in</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ ...selectStyle, marginBottom: 14 }}
          >
            <option value="account">Bank / Account transfer</option>
            <option value="cash">Cash</option>
          </select>
          <label style={labelStyle}>Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. NEFT ref 123456"
            style={{ ...inputStyle, marginBottom: 20 }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
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
              disabled={submitting || !amount}
              style={{ ...btnBase, background: "#c9a84c", color: "#1a1917" }}
            >
              {submitting ? "Saving…" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
